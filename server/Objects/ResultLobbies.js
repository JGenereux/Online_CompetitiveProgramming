class ResultLobbies {
    #lobbies
    #locks

    constructor() {
        this.#lobbies = {}
        this.#locks = {}
    }

    async #acquireLock(lobbyID) {
        if(!this.#locks[lobbyID]){
            this.#locks[lobbyID] = Promise.resolve()
        }

        let resolveNext;
        //create a new promise that is not resolved
        const nextPromise = new Promise((resolve) => (resolveNext = resolve))
        const currentLock = this.#locks[lobbyID]
        this.#locks[lobbyID] = nextPromise;
        await currentLock;
        return resolveNext
    }

    async addUser(lobbyID, user, socketId) {
        const releaseLock = await this.#acquireLock(lobbyID)
        //if lobby doesn't exist create it
        try{
            if(!this.#lobbies[lobbyID]){
                this.#lobbies[lobbyID] = [user]
                return;
            } 

            this.#lobbies[lobbyID].push(user)
        } finally {
            releaseLock();
        }
    }

    async getLobbySize(lobbyID) {
        const releaseLock = await this.#acquireLock(lobbyID)
        try{
            if(!this.#lobbies[lobbyID]) {
                return 0;
            }
            return this.#lobbies[lobbyID].length;
        } finally {
            releaseLock()
        }
    }

    async getLobby(lobbyID) {
        const releaseLock = await this.#acquireLock(lobbyID)
        try{
            const lobby = this.#lobbies[lobbyID] || null
            await removeLobby(lobbyID)
            return lobby
        } finally {
            releaseLock()
        }
    }

    async removeLobby(lobbyID) {
        const releaseLock = await this.#acquireLock(lobbyID);
        try {
            if (this.#lobbies[lobbyID]) {
                delete this.#lobbies[lobbyID];
                delete this.#locks[lobbyID]; 
            }
        } finally {
            releaseLock();
        }
    }
}

module.exports = ResultLobbies