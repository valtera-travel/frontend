import { Link } from 'react-router-dom'
import type { Destination } from '../types/api'

export default function DestinationCard({ d }: { d: Destination }) {
  return (
    <Link to={`/destinations/${d.id}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl">
      <img src={d.imageUrl} alt={d.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-xs uppercase tracking-widest text-white/80">{d.region}</p>
        <h3 className="text-2xl font-semibold">{d.name}</h3>
      </div>
    </Link>
  )
}
