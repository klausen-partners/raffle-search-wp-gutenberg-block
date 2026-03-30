import React from 'react';
import { IconGlobe, IconPdf } from './icons';
import { trimHtml } from '../utils/html';
import { formatDate } from '../utils/date';

// Default image URL injected by backend (see below)
const DEFAULT_IMAGE_URL = window?.raffleSearchDefaultImageUrl || null;

/**
 * @param {Object}                                       props
 * @param {import('../types/searchResult').SearchResult} props.result
 * @param {number}                                       [props.excerptTrimLength]
 * @param {Function}                                     [props.onResultClick]
 */
export default function RaffleResultCard( {
	result,
	excerptTrimLength,
	onResultClick,
} ) {
	// --- Extract metadata ---
	let imageUrl = null;
	let typeTag = null;
	let publishedTime = null;
	let description = null;
	if ( Array.isArray( result.metadata ) ) {
		for ( const meta of result.metadata ) {
			if ( meta.selector === 'image' && meta.matches?.length ) {
				const imgMeta = meta.matches.find(
					( m ) => m.attr?.property === 'og:image'
				);
				if ( imgMeta && imgMeta.attr?.content ) {
					imageUrl = imgMeta.attr.content;
				}
			}
			if ( meta.selector === 'type' && meta.matches?.length ) {
				typeTag =
					meta.matches[ 0 ].attr?.content || meta.matches[ 0 ].value;
			}
			if ( meta.selector === 'published_time' && meta.matches?.length ) {
				const rawTime =
					meta.matches[ 0 ].attr?.content || meta.matches[ 0 ].value;
				publishedTime = formatDate( rawTime );
			}
			if ( meta.selector === 'description' && meta.matches?.length ) {
				description =
					meta.matches[ 0 ].attr?.content || meta.matches[ 0 ].value;
			}
		}
	}

	// Use default image if none found
	if ( ! imageUrl && DEFAULT_IMAGE_URL ) {
		imageUrl = DEFAULT_IMAGE_URL;
	}

	const isPdf = result.url?.toLowerCase().endsWith( '.pdf' );
	const hideExcerpt = false; // always show for this design

	return (
		<li className="raffle-result-card">
			<div
				className="raffle-result-meta-row"
				style={ {
					display: 'flex',
					flexDirection: 'row',
					position: 'relative',
				} }
			>
				{ imageUrl && (
					<div className="raffle-result-image">
						<img
							src={ imageUrl }
							alt={ result.title || '' }
							onError={ ( e ) => {
								if ( DEFAULT_IMAGE_URL ) {
									e.target.src = DEFAULT_IMAGE_URL;
								}
							} }
						/>
					</div>
				) }
				<div
					className="raffle-meta-group raffle-meta-type"
					style={ {
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'start',
						overflow: 'hidden',
						position: 'relative',
						flex: 1,
					} }
				>
					<div
						className="raffle-result-url"
						style={ { overflow: 'hidden', maxWidth: 520 } }
					>
						{ isPdf ? <IconPdf /> : <IconGlobe /> }
						<span style={ { overflow: 'hidden', maxWidth: 520 } }>
							{ result.url }
						</span>
					</div>
					<a
						href={ result.url }
						target="_blank"
						rel="noopener noreferrer"
						className="raffle-result-link"
						onClick={ () =>
							onResultClick?.( result.feedback_data )
						}
					>
						{ result.title }
					</a>
					{ description && (
						<div className="raffle-result-description">
							{ description }
						</div>
					) }
					{ ! hideExcerpt && (
						<div
							className="raffle-result-snippet"
							/* eslint-disable-next-line react/no-danger */
							dangerouslySetInnerHTML={ {
								__html:
									excerptTrimLength && excerptTrimLength > 0
										? trimHtml(
												result.content,
												excerptTrimLength
										  )
										: result.content,
							} }
						/>
					) }
					{ typeTag && (
						<span className="raffle-meta-tag raffle-meta-tag--type">
							{ typeTag }
						</span>
					) }
				</div>
				{ publishedTime && (
					<div
						className="raffle-result-meta-details"
						style={ {
							position: 'absolute',
							right: 0,
							top: 0,
							minWidth: 80,
						} }
					>
						<span
							className="raffle-meta-published-time"
							style={ {
								float: 'right',
								marginRight: 0,
								position: 'absolute',
								right: 0,
							} }
						>
							{ publishedTime }
						</span>
					</div>
				) }
			</div>
		</li>
	);
}
