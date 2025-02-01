async function onUserInputKeydown(e) {
  if (e.key === "Enter") {
    const UserInput = document.querySelector("#user-input");
    UserInput.removeEventListener("keydown", onUserInputKeydown);

    const ChatMessages = document.querySelector("#chat-messages");
    ChatMessages.innerHTML += `        <div style="display: flex; align-items: top">
          <p style="padding-right: 1em"><strong>User:</strong></p>
          <p id="latest-message"></p>
        </div>
`;

    const LatestMessage = document.querySelector("#latest-message");
    LatestMessage.innerText = UserInput.value;
    LatestMessage.removeAttribute("id");

    UserInput.value = "";

    const pageHtml = document.documentElement.outerHTML;
    const res = await fetch("/generate", {
      method: "POST",
      body: pageHtml,
    });
    if (!res.body) return;

    const reader = res.body.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    const Page = document.querySelector("html");
    let content = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      content += decoder.decode(value);
      Page.innerHTML = content;
    }

    function makeScript(node) {
      const script = document.createElement("script");
      script.text = node.innerHTML;
      for (const attr of node.attributes) {
        script.setAttribute(attr.name, attr.value);
      }
      return script;
    }

    function makeScriptsExecutable(node) {
      if (node.tagName === "SCRIPT") {
        node.parentNode.replaceChild(makeScript(node), node);
      } else {
        for (const child of node.childNodes) {
          makeScriptsExecutable(child);
        }
      }
    }

    const Body = document.getElementsByTagName("body")[0];
    makeScriptsExecutable(Body);

    const UserInput2 = document.querySelector("#user-input");
    UserInput2.addEventListener("keydown", onUserInputKeydown);
    UserInput2.focus();
  }
}

document
  .querySelector("#user-input")
  .addEventListener("keydown", onUserInputKeydown);
