
browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
    if (request.message === "retrieve text") {
        console.log("sending inner text")
        sendResponse({message:"sending inner text", text: document.body.innerText,phoneme:request.words });
    }
    else if(request.message == "highlight")
    {
        highlightWords(request.words)
        sendResponse({message:"highlight" });
    }
    else{
        sendResponse({message:"invalid request"})
    }
});
function highlightWords(words)
{
    console.log(words)
    words.sort((a, b) => b.length - a.length);

    for(let word of words)
    {
        let regex = new RegExp(`\\b(${word})\\b`, 'gi');
        document.querySelectorAll("*").forEach((node)=>{if(node.tagName != "STYLE" && node.tagName != "SCRIPT"&& node.tagName != "MARK"){for(const child of node.childNodes){if(child.nodeType == Node.TEXT_NODE){child.nodeValue = child.nodeValue.replace(regex,"<mark>$1</mark>");}}}})
        let htmregex = new RegExp(`&lt;mark&gt;(${word})&lt;/mark&gt`,'gi')
        document.querySelector("*").innerHTML = document.querySelector("*").innerHTML.replace(htmregex,"<mark>"+"$1"+"</mark>")
    }
    

}
