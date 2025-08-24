document.addEventListener('DOMContentLoaded', function() {
  const triggers = Array.from(document.getElementsByClassName('collapsible__trigger'))
  triggers.forEach(el => {
    el.addEventListener('click', (event) => {
      const container = event.target.parentElement.querySelector('.collapsible__container')
      if (container.classList.contains('collapsible__container--collapsed')) {
        event.target.innerText = "Show Less"
      } else {
        event.target.innerText = "Show More"
        event.target.parentElement.scrollIntoView();
      }
      container.classList.toggle('collapsible__container--collapsed')
    })
  })
})
