import { useState, useEffect, useCallback, useMemo } from 'react';
import RaffleResultCard from './RaffleResultCard';
import RaffleFiltersCard from './RaffleFiltersCard';
import { getResultType, getResultTypeLabel } from '../utils/getResultType';
import { __ } from '@wordpress/i18n';
import {
	fetchTopQuestions,
	fetchSuggestions,
	fetchSummary,
	fetchSearchResults,
	sendFeedback,
} from '../api/api';
import { useDebounce } from '../hooks/useDebounce';
import { useQuery, useMutation } from '@tanstack/react-query';
import Spinner from './Spinner';
import { IconSearch, IconSubmit, IconSparkle } from './icons';

function setUrlParam(value) {
	const url = new URL(window.location.href);
	if (value) {
		url.searchParams.set('q', value);
	} else {
		url.searchParams.delete('q');
	}
	window.history.replaceState(null, '', url.toString());
}
export default function RaffleSearch({ searchUid }) {
	// --- Type & tag filter state ---
	const [selectedType, setSelectedType] = useState(null);
	const [selectedTag, setSelectedTag] = useState(null);

	// Parse settings up-front so useMemo hooks can reference them
	const hideSummaryButton = window.raffleSettings?.hideSummaryButton;
	const excerptTrimLength = window.raffleSettings?.excerptTrimLength;
	let hideExcerptTypes = window.raffleSettings?.hideExcerptTypes || '';
	if (typeof hideExcerptTypes === 'string') {
		hideExcerptTypes = hideExcerptTypes
			.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean);
	}
	let hiddenTags = window.raffleSettings?.hiddenTags || '';
	if (typeof hiddenTags === 'string') {
		hiddenTags = hiddenTags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
	}
	const tagsMode = window.raffleSettings?.tagsMode || 'exclude';

	// Fetch results FIRST so it's available for useMemo

	// Only keep one useMutation for results
	const {
		data: results = [],
		isPending: isLoadingResults,
		mutate: getResults,
	} = useMutation({
		mutationKey: ['raffle-search'],
		mutationFn: (q) => fetchSearchResults(q, uid),
	});

	// Compute type counts from results
	const typeCounts = useMemo(() => {
		if (!results || results.length === 0) {
			return [];
		}
		const counts = {};
		results.forEach((r) => {
			const type = getResultType(r);
			counts[type] = (counts[type] || 0) + 1;
		});
		return ['news', 'document', 'page']
			.filter((key) => counts[key] > 0)
			.map((key) => ({
				value: key,
				label: getResultTypeLabel(key),
				count: counts[key],
			}));
	}, [results]);

	// Compute tag counts from results
	const tagCounts = useMemo(() => {
		if (!results || results.length === 0) {
			return [];
		}
		const counts = {};
		results.forEach((r) => {
			if (Array.isArray(r.metadata)) {
				for (const meta of r.metadata) {
					if (meta.selector === 'tag' && meta.matches?.length) {
						const raw =
							meta.matches[0].attr?.content ||
							meta.matches[0].value ||
							'';
						raw.split(',')
							.map((t) => t.trim())
							.filter(Boolean)
							.forEach((tag) => {
								counts[tag] = (counts[tag] || 0) + 1;
							});
					}
				}
			}
		});
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([tag, count]) => ({ value: tag, label: tag, count }))
			.filter(
				({ value }) =>
					hiddenTags.length === 0 ||
					(tagsMode === 'exclude'
						? !hiddenTags.includes(value)
						: hiddenTags.includes(value)),
			);
	}, [results, hiddenTags, tagsMode]);

	// Filtered results by type and/or tag
	const filteredResults = useMemo(() => {
		return results.filter((r) => {
			if (selectedType && getResultType(r) !== selectedType) {
				return false;
			}
			if (selectedTag) {
				let resultTags = [];
				if (Array.isArray(r.metadata)) {
					for (const meta of r.metadata) {
						if (meta.selector === 'tag' && meta.matches?.length) {
							const raw =
								meta.matches[0].attr?.content ||
								meta.matches[0].value ||
								'';
							resultTags = raw
								.split(',')
								.map((t) => t.trim())
								.filter(Boolean);
						}
					}
				}
				if (!resultTags.includes(selectedTag)) {
					return false;
				}
			}
			return true;
		});
	}, [results, selectedType, selectedTag]);

	function filterSummaryContent(html) {
		if (!hideSummaryButton) {
			return html;
		}
		const div = document.createElement('div');
		div.innerHTML = html;
		div.querySelectorAll('a').forEach((btn) => {
			const a = btn.parentNode;
			a.remove();
		});
		div.querySelectorAll('p').forEach((p) => {
			if (
				p.children.length === 1 &&
				p.children[0].tagName === 'A' &&
				p.textContent.trim() === p.children[0].textContent.trim()
			) {
				p.remove();
			}
		});
		div.querySelectorAll(':scope > a').forEach((a) => a.remove());
		return div.innerHTML;
	}

	const initialQ = new URLSearchParams(window.location.search).get('q') ?? '';
	const uid = searchUid || window.raffleSettings?.searchUid || '';

	const [query, setQuery] = useState(initialQ);
	const [inputValue, setInputValue] = useState(initialQ);
	const [isUserTyping, setIsUserTyping] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	const debouncedInput = useDebounce(inputValue, 500);
	const debouncedSearch = useDebounce(inputValue, 800);

	const { data: topQuestions = [], isLoading: isLoadingTopQ } = useQuery({
		queryKey: ['raffle-top-questions', uid],
		queryFn: () => fetchTopQuestions(uid),
		staleTime: 5 * 60 * 1000,
	});

	const {
		data: suggestions = [],
		mutate: getSuggestions,
		reset: clearSuggestions,
	} = useMutation({
		mutationKey: ['raffle-suggestions'],
		mutationFn: (q) => fetchSuggestions(q, uid),
	});

	const {
		data: summary,
		isPending: isLoadingSummary,
		mutate: getSummary,
	} = useMutation({
		mutationKey: ['raffle-summary'],
		mutationFn: (q) => fetchSummary(q, uid),
	});

	const { mutate: submitFeedback } = useMutation({
		mutationKey: ['raffle-feedback'],
		mutationFn: sendFeedback,
	});

	useEffect(() => {
		if (initialQ.trim().length >= 3) {
			handleSearch(initialQ);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (isUserTyping && debouncedInput.length >= 3) {
			getSuggestions(debouncedInput);
		} else if (debouncedInput.length < 3) {
			clearSuggestions();
		}
	}, [debouncedInput, isUserTyping]);

	useEffect(() => {
		if (isUserTyping && debouncedSearch.trim().length >= 3) {
			handleSearch(debouncedSearch);
			if (window.dataLayer) {
				window.dataLayer.push({
					event: 'raffle_auto_search',
					search_query: debouncedSearch,
				});
			}
		}
	}, [debouncedSearch]);

	const handleSearch = useCallback(
		(searchQuery = query) => {
			const q = searchQuery.trim();
			if (!q) {
				return;
			}
			setQuery(q);
			setInputValue(q);
			setIsUserTyping(false);
			setUrlParam(q);
			clearSuggestions();
			setHasSearched(true);
			setSelectedType(null);
			setSelectedTag(null);
			getSummary(q);
			getResults(q);
		},
		[query, clearSuggestions, getSummary, getResults],
	);

	const handleInputChange = (e) => {
		const val = e.target.value;
		setInputValue(val);
		setIsUserTyping(true);
		setUrlParam(val);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSearch(inputValue);
		}
	};

	const handleSuggestionClick = (suggestion) => {
		handleSearch(suggestion);
	};

	const handleTopQuestionClick = (question) => {
		handleSearch(question);
	};

	const handleResultClick = (feedbackData) => {
		if (feedbackData) {
			submitFeedback(feedbackData);
		}
	};

	const showSuggestions = isUserTyping && suggestions.length > 0;
	const showTopQuestions =
		!hasSearched && !showSuggestions && topQuestions.length > 0;
	const showLeftPanel = showSuggestions || showTopQuestions;

	return (
		<div className='raffle-search-block'>
			<div className='raffle-search-input-row'>
				<span className='raffle-search-icon-left'>
					<IconSearch />
				</span>
				<input
					type='search'
					className='raffle-search-input'
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={__('Search…', 'raffle-search')}
					aria-label={__('Search', 'raffle-search')}
					autoComplete='off'
				/>
				<button
					className='raffle-search-btn'
					onClick={() => handleSearch(inputValue)}
					disabled={inputValue.trim().length === 0}
					aria-label={__('Submit search', 'raffle-search')}
				>
					<IconSubmit />
				</button>
			</div>
			{showLeftPanel && (
				<div className='raffle-panel'>
					<h3 className='raffle-panel-title'>
						{showSuggestions
							? __('Suggestions', 'raffle-search')
							: __('Popular Questions', 'raffle-search')}
					</h3>
					{isLoadingTopQ && !showSuggestions ? (
						<Spinner />
					) : (
						<ul className='raffle-list'>
							{(showSuggestions ? suggestions : topQuestions).map(
								(item, i) => {
									const label =
										typeof item === 'string'
											? item
											: item.suggestion ?? item.question;
									return (
										<li
											key={i}
											className='raffle-list-item raffle-list-item--clickable'
										>
											<button
												type='button'
												className='raffle-list-item-btn'
												onClick={() => {
													if (showSuggestions) {
														handleSuggestionClick(
															label,
														);
													} else {
														handleTopQuestionClick(
															label,
														);
													}
												}}
												aria-label={label}
											>
												{label}
											</button>
										</li>
									);
								},
							)}
						</ul>
					)}
				</div>
			)}
			{hasSearched && (
				<div className='raffle-results-area'>
					<div className='raffle-panel raffle-panel--summary'>
						<h3 className='raffle-panel-title raffle-panel-title--ai'>
							<IconSparkle /> {__('AI Summary', 'raffle-search')}
							{isLoadingSummary && <Spinner />}
						</h3>
						{!isLoadingSummary && summary?.status === 'success' ? (
							<>
								<div
									className='raffle-summary-content'
									/* eslint-disable-next-line react/no-danger */
									dangerouslySetInnerHTML={{
										__html: filterSummaryContent(
											summary.summary,
										),
									}}
								/>
								{window.raffleSettings?.showReferences &&
									summary.references?.length > 0 && (
										<>
											<h4 className='raffle-references-title'>
												References
											</h4>
											<ol className='raffle-references-list'>
												{summary.references.map(
													(ref, i) => (
														<li key={i}>
															<a
																href={ref.url}
																target='_blank'
																rel='noopener noreferrer'
															>
																{ref.title}
															</a>
														</li>
													),
												)}
											</ol>
										</>
									)}
							</>
						) : (
							<p className='raffle-empty'>
								{__(
									'No summary available for this query.',
									'raffle-search',
								)}
							</p>
						)}
					</div>
					{isLoadingResults && (
						<div className='raffle-results-loading'>
							<Spinner />
						</div>
					)}
					{!isLoadingResults && results.length === 0 && (
						<p className='raffle-empty'>
							{__(
								'No results found for this query.',
								'raffle-search',
							)}
						</p>
					)}
					{!isLoadingResults && results.length > 0 && (
						<>
							<RaffleFiltersCard
								types={typeCounts}
								selectedType={selectedType}
								onSelectType={setSelectedType}
								tags={tagCounts}
								selectedTag={selectedTag}
								onSelectTag={setSelectedTag}
								onClear={() => {
									setSelectedType(null);
									setSelectedTag(null);
								}}
							/>
							<ul className='raffle-results-list'>
								{filteredResults.map((result, i) => (
									<RaffleResultCard
										key={i}
										result={result}
										excerptTrimLength={excerptTrimLength}
										onResultClick={handleResultClick}
										hideExcerptTypes={hideExcerptTypes}
										hiddenTags={hiddenTags}
										tagsMode={tagsMode}
									/>
								))}
							</ul>
						</>
					)}
				</div>
			)}
		</div>
	);
}
