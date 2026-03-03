import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	fetchTopQuestions,
	fetchSuggestions,
	fetchSummary,
	fetchSearchResults,
	sendFeedback,
} from '../api/api';

// ---------------------------------------------------------------------------
// Tiny debounce hook
// ---------------------------------------------------------------------------
function useDebounce( value, delay ) {
	const [ debounced, setDebounced ] = useState( value );
	useEffect( () => {
		const timer = setTimeout( () => setDebounced( value ), delay );
		return () => clearTimeout( timer );
	}, [ value, delay ] );
	return debounced;
}

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------
function Spinner() {
	return <span className="raffle-spinner" aria-hidden="true" />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function RaffleSearch() {
	const [ query, setQuery ] = useState( '' );
	const [ inputValue, setInputValue ] = useState( '' );
	const [ isUserTyping, setIsUserTyping ] = useState( false );
	const [ hasSearched, setHasSearched ] = useState( false );

	const debouncedInput = useDebounce( inputValue, 500 );

	// --- Top Questions (loaded once on mount) ---
	const { data: topQuestions = [], isLoading: isLoadingTopQ } = useQuery( {
		queryKey: [ 'raffle-top-questions' ],
		queryFn: fetchTopQuestions,
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );

	// --- Autocomplete ---
	const {
		data: suggestions = [],
		mutate: getSuggestions,
		reset: clearSuggestions,
	} = useMutation( {
		mutationKey: [ 'raffle-suggestions' ],
		mutationFn: ( q ) => fetchSuggestions( q ),
	} );

	// --- Summary ---
	const {
		data: summary,
		isPending: isLoadingSummary,
		mutate: getSummary,
		reset: clearSummary,
	} = useMutation( {
		mutationKey: [ 'raffle-summary' ],
		mutationFn: fetchSummary,
	} );

	// --- Search results ---
	const {
		data: results = [],
		isPending: isLoadingResults,
		mutate: getResults,
		reset: clearResults,
	} = useMutation( {
		mutationKey: [ 'raffle-search' ],
		mutationFn: fetchSearchResults,
	} );

	// --- Feedback ---
	const { mutate: submitFeedback } = useMutation( {
		mutationKey: [ 'raffle-feedback' ],
		mutationFn: sendFeedback,
	} );

	// Trigger suggestions when the debounced input reaches 3+ chars.
	useEffect( () => {
		if ( isUserTyping && debouncedInput.length >= 3 ) {
			getSuggestions( debouncedInput );
		} else if ( debouncedInput.length < 3 ) {
			clearSuggestions();
		}
	}, [ debouncedInput, isUserTyping ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const handleSearch = useCallback(
		( searchQuery = query ) => {
			const q = searchQuery.trim();
			if ( ! q ) return;
			setQuery( q );
			setInputValue( q );
			setIsUserTyping( false );
			clearSuggestions();
			setHasSearched( true );
			getSummary( q );
			getResults( q );
		},
		[ query, clearSuggestions, getSummary, getResults ]
	);

	const handleInputChange = ( e ) => {
		setInputValue( e.target.value );
		setIsUserTyping( true );
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
		if ( feedbackData ) submitFeedback( feedbackData );
	};

	// What to show in the left panel.
	const showSuggestions = isUserTyping && suggestions.length > 0;
	const showTopQuestions = ! hasSearched && ! showSuggestions;
	const showLeftPanel = showSuggestions || showTopQuestions;

	return (
		<div className="raffle-search-block">
			{ /* ---------------------------------------------------------------- */ }
			{ /* Search input */ }
			{ /* ---------------------------------------------------------------- */ }
			<div className="raffle-search-input-row">
				<input
					type="search"
					className="raffle-search-input"
					value={ inputValue }
					onChange={ handleInputChange }
					onKeyDown={ handleKeyDown }
					placeholder="Search…"
					aria-label="Search"
					autoComplete="off"
				/>
				<button
					className="raffle-search-btn"
					onClick={ () => handleSearch( inputValue ) }
					disabled={ inputValue.trim().length === 0 }
					aria-label="Submit search"
				>
					Search
				</button>
			</div>

			{ /* ---------------------------------------------------------------- */ }
			{ /* Suggestions / Top Questions panel */ }
			{ /* ---------------------------------------------------------------- */ }
			{ showLeftPanel && (
				<div className="raffle-panel">
					<h3 className="raffle-panel-title">
						{ showSuggestions
							? 'Suggestions'
							: 'Popular Questions' }
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
										onClick={ () =>
											showSuggestions
												? handleSuggestionClick( label )
												: handleTopQuestionClick(
														label
												  )
										}
									>
										{ label }
									</li>
								);
							} ) }
						</ul>
					) }
				</div>
			) }

			{ /* ---------------------------------------------------------------- */ }
			{ /* Results area (shown after first search) */ }
			{ /* ---------------------------------------------------------------- */ }
			{ hasSearched && (
				<div className="raffle-results-area">
					{ /* Summary */ }
					<div className="raffle-panel">
						<h3 className="raffle-panel-title">
							Summary{ isLoadingSummary && <Spinner /> }
						</h3>
						{ isLoadingSummary ? null : summary?.status ===
						  'success' ? (
							<>
								<div
									className="raffle-summary-content"
									/* eslint-disable-next-line react/no-danger */
									dangerouslySetInnerHTML={ {
										__html: summary.summary,
									} }
								/>
								{ summary.references?.length > 0 && (
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
								No summary available for this query.
							</p>
						) }
					</div>

					{ /* Search Results */ }
					<div className="raffle-panel">
						<h3 className="raffle-panel-title">
							Search Results{ isLoadingResults && <Spinner /> }
						</h3>
						{ isLoadingResults ? null : results.length > 0 ? (
							<ul className="raffle-results-list">
								{ results.map( ( result, i ) => (
									<li
										key={ i }
										className="raffle-result-item"
									>
										<a
											href={ result.url }
											target="_blank"
											rel="noopener noreferrer"
											className="raffle-result-link"
											onClick={ () =>
												handleResultClick(
													result.feedback_data
												)
											}
										>
											{ result.title }
										</a>
										<div
											className="raffle-result-snippet"
											/* eslint-disable-next-line react/no-danger */
											dangerouslySetInnerHTML={ {
												__html: result.content,
											} }
										/>
									</li>
								) ) }
							</ul>
						) : (
							<p className="raffle-empty">
								No results found for this query.
							</p>
						) }
					</div>
				</div>
			) }
		</div>
	);
}
