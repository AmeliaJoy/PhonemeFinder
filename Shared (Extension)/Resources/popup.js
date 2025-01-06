import {CMUDictionary} from './CMUDictionary.js';
import {T2W} from './numbers2words.min.js'

console.log("Hello World!", browser);
function represents_ordinal(word) {
    const ordinals = [ 'st', 'nd', 'rd', 'th' ];
    return (ordinals.includes(word.slice(-2)) && represents_int(word.slice(-2)))
}
function represents_int(word) { return !isNaN(word) }
function toOrdinal(translator, word) {
    let num = parseInt(word);
    let ones = num % 10;
    let rest = Math.floor(num / 10);
    let tens = Math.floor((num % 100) / 10);
    const ordinals = [
        "zeroth", "first", "second", "third", "fourth", "fifth", "sixth",
        "seventh", "eighth", "ninth"
    ];
    if (rest == 0) {
        return (ordinals[ones]);
    } else if (tens == 1) {
        return translator.toWords(word) + "th";
    } else if (ones == 0) {
        if (tens != 0) {
            return translator.toWords(num).slice(0, -1) + "ieth";
        } else {
            return translator.toWords(num) + "th";
        }
    } else {
        return translator.toWords(rest * 10) + "-" + ordinals[ones];
    }
}

function clean_str_and_tokenise(line) {
    const chars_to_remove = [ ',', '.', '"', '“', "(", ")", "”" ]
    line = line.replace("-", " ").replace("—", " ")
    let text_clean = [...line ]
                         .filter(i => !chars_to_remove.includes(i))
                         .map(i => i.toLowerCase())
                         .join("")
    let text_dirty = line.split(/\s+/).filter(word => /\w/.test(word));
    let text_words = text_clean.split(/\s+/);
    let cleaned_text_words = [];

    var translator = new T2W("EN_US");
    for (let i = 0; i < text_dirty.length; i++) {
        let word = text_words[i];
        let words;
        if (represents_int(word)) {
            try{
                words = translator.toWords(parseInt(word))
                .replace(",", "")
                .replace("-", " ")
                .split(/\s+/);}
            catch{
                words = ""
            }
        } else if (represents_ordinal(word)) {
            try{
                words = toOrdinal(translator, word)
                .replace(",", "")
                .replace("-", " ")
                .split(/\s+/)}
            catch{
                words = ''
            }
        } else {
            words = [ word ];
        }
        for (let subword of words) {
            cleaned_text_words.push([ text_dirty[i], subword ]);
        }
    }
    return cleaned_text_words;
}
function proto_clean_str(line) {
    var translator = new T2W("EN_US");
    const chars_to_remove =
        [ ',', '.', '"', '“', "(", ")", "”" ];
    const chars_to_space = [",",".","(", ")","_",";","`","=","\'",":","-","/","\"","[","]","?","!","<",">"]
    return line.split(/[\s+.]/).map((word) => {
        //word = word.strip(",").strip(".").strip(":").strip(";")strip("?").strip("!")
        var transformedWord = word.replace("n't", " not").replace("'s"," is");
        if(transformedWord == transformedWord.toUpperCase())
        {
            transformedWord = transformedWord.toLowerCase()
        }

        const transformedChars = [...transformedWord].map((char) => {
            if (chars_to_space.includes(char)) {
                return " ";
            }
            else if(/[A-Z]/.test(char)){
                return " "+ char.toLowerCase();
            }
            else {
                return char;
            }
            
        }).join("").split(/\s+/).filter((w)=>/\w/.test(w)).flatMap((intw)=>{
            let words;
            if (represents_int(intw)) {
                
                try{
                    words = translator.toWords(parseInt(intw))
                    .replace(",", "")
                    .replace("-", " ")
                    .split(/\s+/);}
                catch(error){
                    console.log(error)
                    words = [""]
                }
            } else if (represents_ordinal(intw)) {
                try{
                    words = toOrdinal(translator, intw)
                    .replace(",", "")
                    .replace("-", " ")
                    .split(/\s+/)}
                catch{
                    console.error(error)
                    words = ['']
                }
            } else {
                words = [ intw ];
            }
            return words;
        });
        
        return [word, transformedChars];
    }).filter((chunk) => /\w/.test(chunk[1])).flatMap((item)=>item[1].map((subitem)=>[item[0],subitem]));
}
function createRequestSequence(words) {
    let request = ""
    for (let word of words) {
        request += word[0] + '\n'
    }
    request = request.slice(0, -1);
    return request
}
function findComments(el) {
    var arr = [];
    for (var i = 0; i < el.childNodes.length; i++) {
        var node = el.childNodes[i];
        if (node.nodeType === 8) {
            arr.push(node);
        } else {
            arr.push.apply(arr, findComments(node));
        }
    }
    return arr;
};

var commentNodes = findComments(document);
async function getWords(wordFile) {
    /**try{
        const formData = new FormData();
        formData.append("wordfile", new Blob([wordFile]), "wordfile.txt");
        let response = await
    fetch("http://www.speech.cs.cmu.edu/cgi-bin/tools/logios/lextool2.pl",{
            method:"POST",
            body: formData
        });
        let data = await response.text();
        var commentNodes = findComments(document);
        var url = commentNode[0].textContent.slice(-6,2)
        let response2 = await fetch(url)
        return (await response2.text)

    }
    catch{
        console.error("Requests failed");
     return -1;
    }**/
}

async function CMU_tokenization(tokenized_words) {
    let phonemes = [];
    let untokenized = [];
    console.log(tokenized_words)
    let dict = await CMUDictionary.createDict();
    for (let word of tokenized_words) {
        if (dict.getItem(word[1])) {
            phonemes.push([
                word[0],
                dict.getItem(word[1])
                    .map((phoneme) => [...phoneme]
                                          .filter((char) =>
                                                      /[a-zA-Z]/.test(char))
                                          .join(""))
                    .join(" ")
            ])
        } else {
            untokenized.push([ word[1], phonemes.length ])
            phonemes.push([ word[0], "" ])
        }
    }
    let request = "";
    if (untokenized.length > 0) {
        request = createRequestSequence(untokenized);
        /**let text = getWords(request);
        let text_processed = text.split("\n").filter((line)=>line !=
        "").map((line)=>line.split("\t")[1]) for (let i=0;i <
        untokenized.length;i++){
            phonemes[untokenized[i][1]].push(text_processed[i])
        }**/
    }

    return phonemes;
}
function find_pronunciation(syllable) {
    switch (syllable.toLowerCase().trim()) {
    case "er":
        return "ER";
    case "air":
        return "EH R";
    case "ar":
        return "AA R";
    case "or":
        return "AO R";
    case "":
        return -1;
    case "ir":
    case "ear":
        return "IY R"
    default:
        return syllable.toUpperCase();
    }
}
function find_words(phonemized_words, phoneme) {
    let asa =
        new Set(phonemized_words.filter((word) => word[1].includes(phoneme)).map((word)=>word[0]))
    console.log(phonemized_words.filter((word) => word[1].includes(phoneme)))
    return Array.from(asa)
}
async function phoneme_finder(raw_words, raw_phonemes) {
    return find_words(await CMU_tokenization(proto_clean_str(raw_words)),
               find_pronunciation(raw_phonemes));
    
}
document.getElementById('highlight-btn')
    .addEventListener('click', async function(e) {
        console.log("clicked")
        const phoneme = document.getElementById('word-input').value;
        await notifyContentPage(e, "retrieve text", phoneme)
        // Send the word to the content script
        /**if (word) {
          chrome.tabs.query({ active: true, currentWindow: true },
        function(tabs) { chrome.tabs.sendMessage(tabs[0].id, { action:
        'highlight', word: word });
          });
        }**/
    });
async function notifyContentPage(e, message, words) {
    browser.tabs.query(
        {active : true, currentWindow : true}, async function(tabs) {
            if (tabs.length == 0) {
                console.log("could not send message to the current tab");
            } else {
                try {
                    const response = await browser.tabs.sendMessage(
                        tabs[0].id, {message : message, words : words});
                    await handleResponse(response);
                } catch (error) {
                    handleError(error);
                }
                
            }
        });
}
async function handleResponse(response) {
    console.log(response)
    if (response.message == "sending inner text") {
        let words = (await phoneme_finder(response.text, response.phoneme))
        console.log(words)
        await notifyContentPage("","highlight",words)
    }
}
function handleError(error) { console.log(error) }
