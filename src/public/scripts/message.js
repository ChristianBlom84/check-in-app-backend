
let button = document.getElementById('message-btn');

button.addEventListener('click', () => {
    messageInput= document.getElementById('message');
    
    const data = {
        message: messageInput.value
    };

    Http.Post('/api/push/send', data)
    .then(() => {
        window.location.href = '/message';
    })})