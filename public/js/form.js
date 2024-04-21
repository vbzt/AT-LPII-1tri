const medicamentoSelect = document.getElementById('qntMedicamentos')
const form = document.querySelector('.form')
const inputHidden = document.querySelector('.hidden')

medicamentoSelect.addEventListener('change', (e) => {
  const formAdd = document.querySelectorAll('.formAdd') // retira inputs ja criados se vc ja tiver selecionado pra criar 
  formAdd.forEach(input => {
    input.remove()
  });
  const qnt = e.target.value;
  for(let i = 1; i <= qnt; i++){
    criaInputs()
  }
})

async function criaInputNome(){
  let divPai = document.createElement('div')
  divPai.className = 'form-group formAdd'
  
  let label  = document.createElement('label')
  label.innerHTML = 'Nome do remedio'

  const select = document.createElement('select');
  select.className = 'form-control'
  select.name = 'name'

  const options = []

  const medicamentos = await fetchJSON()

  for(let medicamento of medicamentos){
    options.push(medicamento.nome)
  }
  
  for(let el of options){
    const option = document.createElement('option');
    option.value = el;
    option.innerHTML = el
    select.add(option);
  }

  divPai.appendChild(label)
  divPai.appendChild(select)
  form.insertBefore(divPai, form.lastElementChild)
 
}


function criaInputFreq(){
  let divPai = document.createElement('div')
  divPai.className = 'form-group formAdd'
  
  let label  = document.createElement('label')
  label.innerHTML = 'Frequencia do remedio'

  const select = document.createElement('select');
  select.className = 'form-control'
  select.name = 'freqMedicamentos'
  

  const options = ['2 em 2 horas', '4 em 4 horas', '8 em 8 horas', '12 em 12 horas', '1 vez ao dia'];
  for(let el of options){
    const option = document.createElement('option');
    option.value = el;
    option.innerHTML = el
    select.add(option);
  }

  divPai.appendChild(label)
  divPai.appendChild(select)
  form.insertBefore(divPai, form.lastElementChild)
 
}



function criaInputQnt(){
  let divPai = document.createElement('div')
  divPai.className = 'form-group formAdd'
  
  let label  = document.createElement('label')
  label.innerHTML = 'Quantidade de comprimidos'

  const input = document.createElement('input')
  input.type = 'number'
  input.name = 'qnt'
  input.className = 'form-control'

  divPai.appendChild(label)
  divPai.appendChild(input)
  form.insertBefore(divPai, form.lastElementChild)
}

async function criaInputs(){ // tive que fazer essa bosta pq o nome é uma promisse do json e se eu nao der await os outros 2 inputs sao criados primeiro meudeus que codigo feio
  await criaInputNome()
  criaInputFreq()
  criaInputQnt()
  // funcionou, codigo feio é codigo que nao funciona, viva a gambiarra
}

async function fetchJSON() {
  try {
    const response = await fetch('../json/medicamentos.json');
    const data = await response.json();
    return data
  } catch (e) {
    console.error('>> fetch err:', error);
  }
}


