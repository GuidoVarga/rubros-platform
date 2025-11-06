'use client'

import {
  Skeleton
} from '@rubros/ui'
import { MapProps } from '@rubros/ui/map'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@rubros/ui/map'), { ssr: false, loading: () => <Skeleton className="h-[500px] w-full" /> })

export function CustomMap(props: MapProps) {
  return <Map {...props} />
}