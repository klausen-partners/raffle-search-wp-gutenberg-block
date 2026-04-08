import React from 'react';
import { IconGlobe, IconPdf } from './icons';
import { trimHtml } from '../utils/html';
import { formatDate } from '../utils/date';
import { getResultType, getResultTypeLabel } from '../utils/getResultType';

// Default image URL injected by backend (see below)
const DEFAULT_IMAGE_URL = window?.raffleSearchDefaultImageUrl || null;

/**
 * @param {Object}                                       props
 * @param {import('../types/searchResult').SearchResult} props.result
 * @param {number}                                       [props.excerptTrimLength]
 * @param {Function}                                     [props.onResultClick]
 * @param {string[]}                                     [props.hideExcerptTypes]
 */
export default function RaffleResultCard({
	result,
	excerptTrimLength,
	onResultClick,
	hideExcerptTypes = [],
	hiddenTags = [],
	tagsMode = 'exclude',
}) {
	// --- Extract metadata ---
	let imageUrl = null;
	let publishedTime = null;
	let description = null;
	let tags = [];
	const typeTag = getResultTypeLabel(getResultType(result));
	const imageWidth = window.raffleSettings?.imageWidth ?? 250;

	if (Array.isArray(result.metadata)) {
		for (const meta of result.metadata) {
			if (meta.selector === 'image' && meta.matches?.length) {
				const imgMeta = meta.matches.find(
					(m) => m.attr?.property === 'og:image',
				);
				if (imgMeta && imgMeta.attr?.content) {
					imageUrl = imgMeta.attr.content;
				}
			}
			if (meta.selector === 'published_time' && meta.matches?.length) {
				const rawTime =
					meta.matches[0].attr?.content || meta.matches[0].value;
				publishedTime = formatDate(rawTime);
			}
			if (meta.selector === 'description' && meta.matches?.length) {
				description =
					meta.matches[0].attr?.content || meta.matches[0].value;
			}
			if (meta.selector === 'tag' && meta.matches?.length) {
				const raw =
					meta.matches[0].attr?.content || meta.matches[0].value;
				if (raw) {
					tags = raw
						.split(',')
						.map((t) => t.trim())
						.filter((t) => {
							if (!t) return false;
							if (hiddenTags.length === 0) return true;
							return tagsMode === 'exclude'
								? !hiddenTags.includes(t)
								: hiddenTags.includes(t);
						});
				}
			}
		}
	}

	// Use default image if none found
	if (!imageUrl && DEFAULT_IMAGE_URL) {
		imageUrl = DEFAULT_IMAGE_URL;
	}

	// Determine file extension/type from URL
	let fileType = null;
	if (result.url) {
		const urlParts = result.url.split('.');
		if (urlParts.length > 1) {
			fileType = urlParts[urlParts.length - 1].toLowerCase();
		}
	}

	// Hide excerpt if fileType is in hideExcerptTypes
	const isPdf = fileType === 'pdf';
	const hideExcerpt = hideExcerptTypes.includes(fileType);

	return (
		<li className='raffle-result-card'>
			<div
				className={
					'raffle-result-meta-row' +
					(imageWidth === 0
						? ' raffle-result-meta-row--no-image'
						: '')
				}
			>
				{imageWidth !== 0 && imageUrl && (
					<div className='raffle-result-image'>
						<img
							src={imageUrl}
							alt={result.title || ''}
							onError={(e) => {
								if (DEFAULT_IMAGE_URL) {
									e.target.src = DEFAULT_IMAGE_URL;
								}
							}}
						/>
					</div>
				)}
				<div className='raffle-result-url'>
					{isPdf ? <IconPdf /> : <IconGlobe />}
					<span>{result.url}</span>
				</div>
				{publishedTime && (
					<div className='raffle-result-meta-details'>
						<span className='raffle-meta-published-time'>
							{publishedTime}
						</span>
					</div>
				)}
				<div className='raffle-meta-group raffle-meta-type'>
					<a
						href={result.url}
						target='_blank'
						rel='noopener noreferrer'
						className='raffle-result-link'
						onClick={() => onResultClick?.(result.feedback_data)}
					>
						{result.title}
					</a>
					{description && (
						<div className='raffle-result-description'>
							{description}
						</div>
					)}
					{!hideExcerpt && (
						<div
							className='raffle-result-snippet'
							/* eslint-disable-next-line react/no-danger */
							dangerouslySetInnerHTML={{
								__html:
									excerptTrimLength && excerptTrimLength > 0
										? trimHtml(
												result.content,
												excerptTrimLength,
										  )
										: result.content,
							}}
						/>
					)}
					{typeTag && (
						<span className='raffle-meta-tag raffle-meta-tag--type'>
							{typeTag}
						</span>
					)}
					{tags.length > 0 && (
						<div className='raffle-meta-group raffle-meta-tags'>
							{tags.map((tag) => (
								<span
									key={tag}
									className='raffle-meta-tag raffle-meta-tag--tag'
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</li>
	);
}
