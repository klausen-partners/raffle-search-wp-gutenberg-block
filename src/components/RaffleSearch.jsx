import { useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	fetchTopQuestions,
	fetchSuggestions,
	fetchSummary,
	fetchSearchResults,
	sendFeedback,
} from '../api/api';
import { useDebounce } from '../hooks/useDebounce';
import Spinner from './Spinner';
import {
	IconSearch,
	IconSubmit,
	IconGlobe,
	IconPdf,
	IconSparkle,
} from './icons';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function RaffleSearch() {
	const [query, setQuery] = useState('');
	const [inputValue, setInputValue] = useState('');
	const [isUserTyping, setIsUserTyping] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	const debouncedInput = useDebounce(inputValue, 500);
	const debouncedSearch = useDebounce(inputValue, 800);

	// --- Top Questions (loaded once on mount) ---
	const { data: topQuestions = [], isLoading: isLoadingTopQ } = useQuery({
		queryKey: ['raffle-top-questions'],
		queryFn: fetchTopQuestions,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// --- Autocomplete ---
	const {
		data: suggestions = [],
		mutate: getSuggestions,
		reset: clearSuggestions,
	} = useMutation({
		mutationKey: ['raffle-suggestions'],
		mutationFn: (q) => fetchSuggestions(q),
	});

	// --- Summary ---
	const {
		data: summary,
		isPending: isLoadingSummary,
		mutate: getSummary,
		reset: clearSummary,
	} = useMutation({
		mutationKey: ['raffle-summary'],
		mutationFn: fetchSummary,
	});

	// --- Search results ---
	const {
		data: results = [],
		isPending: isLoadingResults,
		mutate: getResults,
		reset: clearResults,
	} = useMutation({
		mutationKey: ['raffle-search'],
		mutationFn: fetchSearchResults,
	});

	// --- Feedback ---
	const { mutate: submitFeedback } = useMutation({
		mutationKey: ['raffle-feedback'],
		mutationFn: sendFeedback,
	});

	// Trigger suggestions when the debounced input reaches 3+ chars.
	useEffect(() => {
		if (isUserTyping && debouncedInput.length >= 3) {
			getSuggestions(debouncedInput);
		} else if (debouncedInput.length < 3) {
			clearSuggestions();
		}
	}, [debouncedInput, isUserTyping]); // eslint-disable-line react-hooks/exhaustive-deps

	// Auto-search after the user stops typing (800 ms debounce).
	useEffect(() => {
		if (isUserTyping && debouncedSearch.trim().length >= 3) {
			handleSearch(debouncedSearch);
		}
	}, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleSearch = useCallback(
		(searchQuery = query) => {
			const q = searchQuery.trim();
			if (!q) return;
			setQuery(q);
			setInputValue(q);
			setIsUserTyping(false);
			clearSuggestions();
			setHasSearched(true);
			getSummary(q);
			getResults(q);
		},
		[query, clearSuggestions, getSummary, getResults],
	);

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
		setIsUserTyping(true);
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
		if (feedbackData) submitFeedback(feedbackData);
	};

	// What to show in the left panel.
	const showSuggestions = isUserTyping && suggestions.length > 0;
	const showTopQuestions =
		!hasSearched && !showSuggestions && topQuestions.length > 0;
	const showLeftPanel = showSuggestions || showTopQuestions;

	return (
		<div className='raffle-search-block'>
			{/* ---------------------------------------------------------------- */}
			{/* Search input */}
			{/* ---------------------------------------------------------------- */}
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

			{/* ---------------------------------------------------------------- */}
			{/* Suggestions / Top Questions panel */}
			{/* ---------------------------------------------------------------- */}
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
											onClick={() =>
												showSuggestions
													? handleSuggestionClick(
															label,
													  )
													: handleTopQuestionClick(
															label,
													  )
											}
										>
											{label}
										</li>
									);
								},
							)}
						</ul>
					)}
				</div>
			)}

			{/* ---------------------------------------------------------------- */}
			{/* Results area (shown after first search) */}
			{/* ---------------------------------------------------------------- */}
			{hasSearched && (
				<div className='raffle-results-area'>
					{/* Summary */}
					<div className='raffle-panel raffle-panel--summary'>
						<h3 className='raffle-panel-title raffle-panel-title--ai'>
							<IconSparkle /> {__('AI Summary', 'raffle-search')}
							{isLoadingSummary && <Spinner />}
						</h3>
						{isLoadingSummary ? null : summary?.status ===
						  'success' ? (
							<>
								<div
									className='raffle-summary-content'
									/* eslint-disable-next-line react/no-danger */
									dangerouslySetInnerHTML={{
										__html: summary.summary,
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

					{/* Search Results */}
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
						<ul className='raffle-results-list'>
							{results.map((result, i) => {
								const isPdf = result.url
									?.toLowerCase()
									.endsWith('.pdf');
								return (
									<li key={i} className='raffle-result-card'>
										<div className='raffle-result-url'>
											{isPdf ? (
												<IconPdf />
											) : (
												<IconGlobe />
											)}
											<span>{result.url}</span>
										</div>
										<a
											href={result.url}
											target='_blank'
											rel='noopener noreferrer'
											className='raffle-result-link'
											onClick={() =>
												handleResultClick(
													result.feedback_data,
												)
											}
										>
											{result.title}
										</a>
										<div
											className='raffle-result-snippet'
											/* eslint-disable-next-line react/no-danger */
											dangerouslySetInnerHTML={{
												__html: result.content,
											}}
										/>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
