export interface AppInfo {
  canrepeat?: boolean
  canseek?: boolean
  canshuffle?: boolean
  partymode?: boolean
  percentage?: number
  playlistid?: number
  position?: number
  repeat?: string
  shuffled?: boolean
  speed?: number
  time?: Time
  totaltime?: Totaltime
}

export interface Time {
  hours: number
  milliseconds: number
  minutes: number
  seconds: number
}

export interface Totaltime {
  hours: number
  milliseconds: number
  minutes: number
  seconds: number
}

export interface CurrentTrack {
  fanart: string
  album: string
  file: string
  label: string
  thumbnail: string
  title: string
  type: string
  artist: string[]
}