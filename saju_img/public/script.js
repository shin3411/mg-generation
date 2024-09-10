document.getElementById('saju-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const birthdate = document.getElementById('birthdate').value;
  const birthtime = document.getElementById('birthtime').value;
  const gender = document.getElementById('gender').value;

  try {
    const response = await axios.post('/generate-image', {
      birthdate: birthdate,
      birthtime: birthtime,
      gender: gender
    });

    const imageUrl = response.data.imageUrl;
    const imgElement = document.getElementById('generated-image');
    imgElement.src = imageUrl;
    imgElement.style.display = 'block';
  } catch (error) {
    console.error('이미지 생성 실패:', error);
    alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
  }
});
