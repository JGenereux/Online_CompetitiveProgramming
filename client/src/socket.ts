import {io} from 'socket.io-client'

const URL = 'https://codeblitz.up.railway.app/'

export const socket = io(URL)

