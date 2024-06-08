document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    

    const body = `Nome: ${encodeURIComponent(name)}%0AMessaggio: ${encodeURIComponent(message)}`;
    const mailtoLink = `mailto:frabeauty22@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
        document.getElementById('contactForm').reset();
    }, 2000);
});
