var text = 'DOM DISPLAY DETECTOR',
    title = document.querySelector('#title'),
    span = title.querySelectorAll('span'),
    writeI,
    i = 0;

DOMDisplayDetector.bind(title, function() {
    writeI = setInterval(write, 100);
}, function() {
    clearInterval(writeI);
    span[0].innerHTML = '';
    i = 0;
});

function write() {
    if(i != text.length) {
        if(i == 0) {
            span[1].classList.remove('active');
        }

        span[0].innerHTML += text[i];
        i++;
    } else {
        span[1].classList.add('active');
        clearInterval(writeI);
    }
}

DOMDisplayDetector.bindOnce('.box', function(e) {
    e.target.classList.add('active');
})