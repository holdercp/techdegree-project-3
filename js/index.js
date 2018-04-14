const titleInput = document.getElementById('title');
const titleOtherInput = document.getElementById('other-title');

document.getElementById('name').focus();
titleOtherInput.style = 'display: none;';

titleInput.addEventListener('change', (e) => {
  const selectedOption = e.target.value;
  if (selectedOption === 'other') {
    titleOtherInput.style = 'display: block;';
  } else {
    titleOtherInput.style = 'display: none;';
  }
});
