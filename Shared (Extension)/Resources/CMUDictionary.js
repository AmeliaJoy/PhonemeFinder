//
//  CMUDictionary.js
//  PhonemeFinder
//
//  Created by Amelia Schroeder on 12/22/24.
//
export class CMUDictionary {
    bUsingCloud;
    cachedDict;
    db;
    static async createDict() {
        let newDict = new CMUDictionary();
        await newDict.loadDict();
        return newDict;
    }
    async loadDict() {
        let dictionary;
                this.bUsingCloud = false;
                this.cachedDict =await this.loadDictFromRaw();
    
          
    }

    async loadDictFromRaw() {
        let cachedDict;
        const cmudictFileUrl = browser.runtime.getURL('cmudict-0.7b');
        try{
            let response = await fetch(cmudictFileUrl);
            let data = await response.text();
            cachedDict = processCMUDict(data);
            console.log(cachedDict[0]);
            return cachedDict}
            catch{
                console.error('Error loading CMUdict:', error); // Handle errors
                return null; // Return null in case of failure
            };
    }
     getItem(name) {

            return this.cachedDict[name];
    
    }
}
function processCMUDict(fileContent) {
    const lines = fileContent.split('\n');
    let dictionary ={};
    lines.forEach(line => {
        // Ignore comments or empty lines
        if (line.trim() && !line.startsWith(';')) {

            const parts = line.split(/\s+/);
            const word = parts[0].toLowerCase();
            const pronunciation = parts.slice(1);
            dictionary[word] = pronunciation;
        }
    });
    return dictionary;
}
