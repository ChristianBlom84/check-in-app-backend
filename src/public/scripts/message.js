
let button = document.getElementById('message-btn');

button.addEventListener('click', () => {
    messageInput= document.getElementById('message');
    
    const data = {
        message: messageInput.value
    }
    console.log(data)
})