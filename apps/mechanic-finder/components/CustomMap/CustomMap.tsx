'use client'

import { MapProps } from '@rubros/ui/map'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@rubros/ui/map'), { ssr: false })

export function CustomMap(props: MapProps) {
  return <Map {...props} />
}