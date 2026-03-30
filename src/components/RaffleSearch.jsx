import { useState, useEffect, useCallback } from 'react';
import RaffleResultCard from './RaffleResultCard';
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

function setUrlParam( value ) {
	const url = new URL( window.location.href );
	if ( value ) {
		url.searchParams.set( 'q', value );
	} else {
		url.searchParams.delete( 'q' );
	}
	window.history.replaceState( null, '', url.toString() );
}

export default function RaffleSearch( { searchUid } ) {
	const hideSummaryButton = window.raffleSettings?.hideSummaryButton;
	const excerptTrimLength = window.raffleSettings?.excerptTrimLength;

	function filterSummaryContent( html ) {
		if ( ! hideSummaryButton ) {
			return html;
		}
		const div = document.createElement( 'div' );
		div.innerHTML = html;
		div.querySelectorAll( 'a > button' ).forEach( ( btn ) => {
			const a = btn.parentNode;
			if ( a && a.tagName === 'A' ) {
				a.remove();
			}
		} );
		div.querySelectorAll( 'p' ).forEach( ( p ) => {
			if (
				p.children.length === 1 &&
				p.children[ 0 ].tagName === 'A' &&
				p.textContent.trim() === p.children[ 0 ].textContent.trim()
			) {
				p.remove();
			}
		} );
		div.querySelectorAll( ':scope > a' ).forEach( ( a ) => a.remove() );
		return div.innerHTML;
	}

	const initialQ =
		new URLSearchParams( window.location.search ).get( 'q' ) ?? '';
	const uid = searchUid || window.raffleSettings?.searchUid || '';

	const [ query, setQuery ] = useState( initialQ );
	const [ inputValue, setInputValue ] = useState( initialQ );
	const [ isUserTyping, setIsUserTyping ] = useState( false );
	const [ hasSearched, setHasSearched ] = useState( false );

	const debouncedInput = useDebounce( inputValue, 500 );
	const debouncedSearch = useDebounce( inputValue, 800 );

	const { data: topQuestions = [], isLoading: isLoadingTopQ } = useQuery( {
		queryKey: [ 'raffle-top-questions', uid ],
		queryFn: () => fetchTopQuestions( uid ),
		staleTime: 5 * 60 * 1000,
	} );

	const {
		data: suggestions = [],
		mutate: getSuggestions,
		reset: clearSuggestions,
	} = useMutation( {
		mutationKey: [ 'raffle-suggestions' ],
		mutationFn: ( q ) => fetchSuggestions( q, uid ),
	} );

	const {
		data: summary,
		isPending: isLoadingSummary,
		mutate: getSummary,
	} = useMutation( {
		mutationKey: [ 'raffle-summary' ],
		mutationFn: ( q ) => fetchSummary( q, uid ),
	} );

	const {
		data: results = [],
		isPending: isLoadingResults,
		mutate: getResults,
	} = useMutation( {
		mutationKey: [ 'raffle-search' ],
		mutationFn: ( q ) => fetchSearchResults( q, uid ),
	} );

	const { mutate: submitFeedback } = useMutation( {
		mutationKey: [ 'raffle-feedback' ],
		mutationFn: sendFeedback,
	} );

	useEffect( () => {
		if ( initialQ.trim().length >= 3 ) {
			handleSearch( initialQ );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect( () => {
		if ( isUserTyping && debouncedInput.length >= 3 ) {
			getSuggestions( debouncedInput );
		} else if ( debouncedInput.length < 3 ) {
			clearSuggestions();
		}
	}, [ debouncedInput, isUserTyping ] );

	useEffect( () => {
		if ( isUserTyping && debouncedSearch.trim().length >= 3 ) {
			handleSearch( debouncedSearch );
			if ( window.dataLayer ) {
				window.dataLayer.push( {
					event: 'raffle_auto_search',
					search_query: debouncedSearch,
				} );
			}
		}
	}, [ debouncedSearch ] );

	const handleSearch = useCallback(
		( searchQuery = query ) => {
			const q = searchQuery.trim();
			if ( ! q ) {
				return;
			}
			setQuery( q );
			setInputValue( q );
			setIsUserTyping( false );
			setUrlParam( q );
			clearSuggestions();
			setHasSearched( true );
			getSummary( q );
			getResults( q );
		},
		[ query, clearSuggestions, getSummary, getResults ]
	);

	const handleInputChange = ( e ) => {
		const val = e.target.value;
		setInputValue( val );
		setIsUserTyping( true );
		setUrlParam( val );
	};

	const handleKeyDown = ( e ) => {
		if ( e.key === 'Enter' ) {
			handleSearch( inputValue );
		}
	};

	const handleSuggestionClick = ( suggestion ) => {
		handleSearch( suggestion );
	};

	const handleTopQuestionClick = ( question ) => {
		handleSearch( question );
	};

	const handleResultClick = ( feedbackData ) => {
		if ( feedbackData ) {
			submitFeedback( feedbackData );
		}
	};

	const showSuggestions = isUserTyping && suggestions.length > 0;
	const showTopQuestions =
		! hasSearched && ! showSuggestions && topQuestions.length > 0;
	const showLeftPanel = showSuggestions || showTopQuestions;

	return (
		<div className="raffle-search-block">
			<div className="raffle-search-input-row">
				<span className="raffle-search-icon-left">
					<IconSearch />
				</span>
				<input
					type="search"
					className="raffle-search-input"
					value={ inputValue }
					onChange={ handleInputChange }
					onKeyDown={ handleKeyDown }
					placeholder={ __( 'Search…', 'raffle-search' ) }
					aria-label={ __( 'Search', 'raffle-search' ) }
					autoComplete="off"
				/>
				<button
					className="raffle-search-btn"
					onClick={ () => handleSearch( inputValue ) }
					disabled={ inputValue.trim().length === 0 }
					aria-label={ __( 'Submit search', 'raffle-search' ) }
				>
					<IconSubmit />
				</button>
			</div>
			{ showLeftPanel && (
				<div className="raffle-panel">
					<h3 className="raffle-panel-title">
						{ showSuggestions
							? __( 'Suggestions', 'raffle-search' )
							: __( 'Popular Questions', 'raffle-search' ) }
					</h3>
					{ isLoadingTopQ && ! showSuggestions ? (
						<Spinner />
					) : (
						<ul className="raffle-list">
							{ ( showSuggestions
								? suggestions
								: topQuestions
							).map( ( item, i ) => {
								const label =
									typeof item === 'string'
										? item
										: item.suggestion ?? item.question;
								return (
									<li
										key={ i }
										className="raffle-list-item raffle-list-item--clickable"
									>
										<button
											type="button"
											className="raffle-list-item-btn"
											onClick={ () => {
												if ( showSuggestions ) {
													handleSuggestionClick(
														label
													);
												} else {
													handleTopQuestionClick(
														label
													);
												}
											} }
											aria-label={ label }
										>
											{ label }
										</button>
									</li>
								);
							} ) }
						</ul>
					) }
				</div>
			) }
			{ hasSearched && (
				<div className="raffle-results-area">
					<div className="raffle-panel raffle-panel--summary">
						<h3 className="raffle-panel-title raffle-panel-title--ai">
							<IconSparkle />{ ' ' }
							{ __( 'AI Summary', 'raffle-search' ) }
							{ isLoadingSummary && <Spinner /> }
						</h3>
						{ ! isLoadingSummary &&
						summary?.status === 'success' ? (
							<>
								<div
									className="raffle-summary-content"
									/* eslint-disable-next-line react/no-danger */
									dangerouslySetInnerHTML={ {
										__html: filterSummaryContent(
											summary.summary
										),
									} }
								/>
								{ window.raffleSettings?.showReferences &&
									summary.references?.length > 0 && (
										<>
											<h4 className="raffle-references-title">
												References
											</h4>
											<ol className="raffle-references-list">
												{ summary.references.map(
													( ref, i ) => (
														<li key={ i }>
															<a
																href={ ref.url }
																target="_blank"
																rel="noopener noreferrer"
															>
																{ ref.title }
															</a>
														</li>
													)
												) }
											</ol>
										</>
									) }
							</>
						) : (
							<p className="raffle-empty">
								{ __(
									'No summary available for this query.',
									'raffle-search'
								) }
							</p>
						) }
					</div>
					{ isLoadingResults && (
						<div className="raffle-results-loading">
							<Spinner />
						</div>
					) }
					{ ! isLoadingResults && results.length === 0 && (
						<p className="raffle-empty">
							{ __(
								'No results found for this query.',
								'raffle-search'
							) }
						</p>
					) }
					{ ! isLoadingResults && results.length > 0 && (
						<ul className="raffle-results-list">
							{ results.map( ( result, i ) => (
								<RaffleResultCard
									key={ i }
									result={ result }
									excerptTrimLength={ excerptTrimLength }
									onResultClick={ handleResultClick }
								/>
							) ) }
						</ul>
					) }
				</div>
			) }
		</div>
	);
}
