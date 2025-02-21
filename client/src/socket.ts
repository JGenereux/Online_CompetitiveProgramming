import {io} from 'socket.io-client'

const URL = 'https://codeblitz.up.railway.app/'
const testURL = 'http://localhost:5000/'

export const socket = io(testURL)

