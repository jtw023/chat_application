const name = document.getElementById('name');
const instructions = document.querySelector('.instructions');
const button = document.querySelector('button');

setInterval(() => {
    if (name.value.length > 10) {
        instructions.style.color = 'red';
        button.setAttribute('disabled', 'disabled');
    } else if (name.value.length <= 10) {
        instructions.style.color = '#777';
        button.removeAttribute('disabled');
    }
}, 1000);
