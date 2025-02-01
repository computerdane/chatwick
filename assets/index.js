async function onUserInputKeydown(e) {
  if (e.key === "Enter") {
    const UserInput = document.querySelector("#user-input");
    UserInput.removeEventListener("keydown", onUserInputKeydown);

    const ChatMessages = document.querySelector("#chat-messages");
    ChatMessages.innerHTML +=
      '<div class="flex flex-row chat-message"><p class="chat-message-role"><strong>User:</strong></p><p id="latest-message"></p></div>';
    const LatestMessage = document.querySelector("#latest-message");
    LatestMessage.innerText = UserInput.value;
    LatestMessage.removeAttribute("id");

    UserInput.value = "";

    const pageHtml = document.documentElement.outerHTML;
    const res = await fetch("http://localhost:3000/generate", {
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

    {
      const UserInput = document.querySelector("#user-input");
      UserInput.addEventListener("keydown", onUserInputKeydown);
      UserInput.focus();
    }
  }
}

const UserInput = document.querySelector("#user-input");
UserInput.addEventListener("keydown", onUserInputKeydown);
