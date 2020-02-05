function disableTaskForms() {
    const formClass = 'task-form';
    document.body.querySelectorAll(`.${formClass}`).forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    disableTaskForms();
});