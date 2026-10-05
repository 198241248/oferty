// Funkcja wywoływana przy zmianie danych w dowolnym polu wiersza
function obliczWiersz(element) {
  // Znajdź wiersz (tr), w którym nastąpiła zmiana
  const wiersz = element.closest('tr');

  // Pobranie wartości z pól w tym wierszu
  const szer = parseFloat(wiersz.querySelector('.szerokosc').value) || 0;
  const wys = parseFloat(wiersz.querySelector('.wysokosc').value) || 0;
  const gleb = parseFloat(wiersz.querySelector('.glebokosc').value) || 0;
  const cenaKorpus = parseFloat(wiersz.querySelector('.cena-korpus').value) || 0;
  const cenaFront = parseFloat(wiersz.querySelector('.cena-front').value) || 0;

  // Przeliczenie mm na metry
  const szerM = szer / 1000;
  const wysM = wys / 1000;
  const glebM = gleb / 1000;

  // Wzór uproszczony na powierzchnię płyt (front + boki szafki)
  const powFront = szerM * wysM;
  const powBoki = 2 * (wysM * glebM) + 2 * (szerM * glebM);
  
  // Obliczenie ceny wiersza
  const kosztFrontu = powFront * cenaFront;
  const kosztKorpusu = powBoki * cenaKorpus;
  const cenaCalkowita = kosztFrontu + kosztKorpusu;

  // Wpisanie wyniku do wiersza
  wiersz.querySelector('.cena-calosc').innerText = cenaCalkowita.toFixed(2);

  // Aktualizacja sumy łącznej dla wszystkich szafek
  obliczSumeCalkowita();
}

// Funkcja zliczająca sumę ze wszystkich wierszy
function obliczSumeCalkowita() {
  let suma = 0;
  const wszystkieCeny = document.querySelectorAll('.cena-calosc');

  wszystkieCeny.forEach(span => {
    suma += parseFloat(span.innerText) || 0;
  });

  document.getElementById('suma-ostateczna').innerText = suma.toFixed(2);
}

// Przeliczenie początkowe przy załadowaniu strony
window.onload = function() {
  const pierwszyPierwiastek = document.querySelector('.szerokosc');
  if (pierwszyPierwiastek) {
    obliczWiersz(pierwszyPierwiastek);
  }
};
