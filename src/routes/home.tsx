import { useInfiniteEntriesQuery } from "../api/get-entries";
import { Helmet } from "react-helmet-async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { PulseLoader } from "react-spinners";
import { Fragment } from "react/jsx-runtime";
import { InView } from "react-intersection-observer";
import { useForm } from "react-hook-form";
import { youtube_parser, youtubeURLRegex } from "../util/parse-url";
import { useNavigate } from "react-router-dom";
import chroma from 'chroma-js';

export function Component() {
	//hook for infinite pagination on fetching entries
	const {
		data,
		isLoading,
		isFetching,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteEntriesQuery(5);
	//hook for form state
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{url: string}>({})

	const nav = useNavigate();
	//form (search) submission handler
	const onSubmit = (data: {url: string}) => {
		nav(`/rate/${youtube_parser(data.url)}`);
	};
	const scaleEnergy = chroma.scale(['#FDE047', '#22C55E']);
	const scaleSharpness = chroma.scale(['#F9A8D4', '#4338CA']);
	const scaleMood = chroma.scale(['#000', '#FFF']);
	const scaleColor = chroma.scale([chroma.lch(100, 150, 10), chroma.lch(100, 150, 95), chroma.lch(100, 150, 175), chroma.lch(100, 150, 260),  chroma.lch(100, 150, 345)]).mode('hsl');

	return (
		<>
			<Helmet>
				<title>Home</title>
			</Helmet>
			<div className='flex flex-col items-center'>
				<div className='w-full h-[80vh] flex flex-col items-center justify-center gap-2'>
					<h2>Enter Youtube URL:</h2>
					<form onSubmit={handleSubmit(onSubmit)} className='relative'>
						<input type='text' className='border-2 rounded-3xl p-1 text-center text-2xl' size={80} {...register('url', {
							pattern: {
								value: youtubeURLRegex,
								message: 'Invalid URL!',
							},
						})} />
						<button type='submit' className='absolute top-1/2 right-0 -translate-x-1/4 -translate-y-1/2 h-4/5 grid place-content-center aspect-square'><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
					</form>
					{errors.url?.message && <p className="text-red-600">{errors.url?.message.toString()}</p>}
				</div>
				<h4 className='text-lg'>Recently Rated:</h4>
				<div className='flex flex-col gap-3 w-fit min-w-[800px] m-5'>
					{data?.pages.map((entries, ind) => 
						<Fragment key={ind}>
							{entries.map((entry, ind) => 
								<div key={ind} className='grid grid-cols-[max-content_1fr] border-2 rounded-3xl p-5 flex gap-3 drop-shadow-md bg-slate-50'>
									<img src={`https://i.ytimg.com/vi/${entry.vid}/hqdefault.jpg`} width="150px" />
									<div className="h-100 flex flex-col">
										<a className='underline text-blue-500' href={`https://www.youtube.com/watch?v=${entry.video.id}`}><p className='text-xl'>{entry.video.title}</p></a>
										<p>Rated by {entry.name}</p>
										<p className='italic text-slate-500 text-sm'>{new Date(entry.timestamp).toLocaleString()}</p>
										<div className="grow flex flex-row items-center h-100 gap-3">
											<div className="h-[50%] aspect-square" style={{backgroundColor: scaleEnergy(entry.labels.energy).css()}} />
											<div className="h-[50%] aspect-square" style={{backgroundColor: scaleSharpness(entry.labels.sharpness).css()}} />
											<div className="h-[50%] aspect-square" style={{backgroundColor: scaleMood(entry.labels.mood).css()}} />
											<div className="h-[50%] aspect-square" style={{backgroundColor: scaleColor(entry.labels.color).css()}} />
										</div>
									</div>
								</div>
							)}
						</Fragment>
					)}
				</div>
				<InView as='div' onChange={(inView) => {
					if (inView && !isFetching) {
						fetchNextPage();
					}
				}} className='h-[10vh] w-full z-50 flex flex-col items-center justify-center'>
					{(isLoading || isFetching) && <PulseLoader loading={true} />}
					{(!isFetching && !hasNextPage) && <h4 className='text-lg'>No more entries :(</h4>}
				</InView>
			</div>
			<div className='fixed bottom-0 left-0 right-0 h-[20vh] z-40 bg-gradient-to-b from-transparent to-white' />
		</>
	);
}