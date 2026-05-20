//document.getElementById('debug').innerText = "Debug: Game initialized"

// 4 main regions
const buttons = ["button-1", "button-2", "button-3", "button-4"]
const sections = ["section-1", "section-2"]

for (let i = 0; i < buttons.length; i++) {
    const elems = document.querySelectorAll('.' + buttons[i]);
    elems.forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            const targetIndex = i + 1;
            // if board is closed, open it and scroll to the section
            if (!isBoardVisible()) {
                openBoard();
                scrollToSection(targetIndex);
                return;
            }
            // if board is open and the section is already aligned, flash the button
            if (isSectionAligned(targetIndex)) {
                flickerPlay(e.currentTarget || el);
                return;
            }
            // otherwise scroll to the section
            scrollToSection(targetIndex);
        });
    });
}

function isSectionAligned(sectionIndex, threshold = 6) {
    const board = document.getElementById('board');
    const target = document.getElementById('section-' + sectionIndex);
    if (!board || !target) return false;
    const boardRect = board.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const delta = Math.abs(targetRect.top - boardRect.top);
    return delta <= threshold;
}
function scrollToSection(sectionIndex){
    const container = document.getElementById('board');
    const target = document.getElementById('section-' + sectionIndex);
    if (!container || !target) return;

    container.scrollTo({
        top: target.offsetTop- container.offsetTop,
        behavior: 'smooth'
    });
}
function closeBoard(){
    document.getElementById('board').classList.add('boardHidden');
}
function openBoard(){
    document.getElementById('board').classList.remove('boardHidden');
}
function isBoardVisible(){
    return !document.getElementById('board').classList.contains('boardHidden');
}

// Play button
document.querySelectorAll('.play').forEach(el => {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        if (isBoardVisible()) {
            closeBoard();
        } else {
            flickerPlay(e.currentTarget);
        }
    });
});

function flickerPlay(el, interval = 150) {
    el.classList.add('alert');
    setTimeout(() => el.classList.remove('alert'), interval);
}