const textbox = document.getElementById("txt");

document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab' && document.activeElement === textbox) {
        event.preventDefault();
        insertTab();
    }
});

function insertTab() {
    const textarea = document.getElementById("txt");
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);

    // Insert the tab character at the cursor position
    textarea.value = textBefore + '\t' + textAfter;

    // Move the cursor to the right position
    textarea.setSelectionRange(cursorPos + 1, cursorPos + 1);
}