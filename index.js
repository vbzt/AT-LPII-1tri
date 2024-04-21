const express = require('express')
const exphbs = require('express-handlebars')
const fs = require('fs').promises
const path = require('path')


// plugin d matematica no handlebars
const Handlebars = require('handlebars');
const helpers = require('handlebars-helpers');
helpers({ handlebars: Handlebars });







const app = express()

app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(express.static('public'))

app.get('/', async (req, res) =>{
  const pacientes = await readJSON('pacientes.json')
  res.render('home', { pacientes })
})

// pacientes 


app.get('/pacientes', async (req, res) =>{
  const pacientes = await readJSON('pacientes.json')
  res.render('pacientes', { pacientes })
})



app.post('/pacientes/delete', async(req, res) => {
  const pacientes = await readJSON('pacientes.json')
  const id = req.body.id

  const item = pacientes.findIndex(paciente => paciente.id == id)
  pacientes.splice(item, 1)
  updateJSON(pacientes, 'pacientes.json')
  console.log('>> paciente deletado id: ' + id)
  res.redirect('/pacientes')
});


app.get('/pacientes/add', async(req, res) => {
  const medicamentos = await readJSON('medicamentos.json')
  console.log(medicamentos[0].quantidade)
  const qntMedicamentos = medicamentos.length
  res.render('add/pacienteAdd', {medicamentos, qntMedicamentos})
})

app.post('/pacientes/add', async (req, res) => {
  const medicamentosJson = await readJSON('medicamentos.json')
  let qntValida = true

  const nome = req.body.paciente
  const idade = req.body.idade
  const id = await createId('pacientes.json')

  const qntSelected = req.body.qntMedicamentos
  const remedio = req.body.name
  const quantidade = req.body.qnt
  const tempo = req.body.freqMedicamentos
  const medicamentos = []

  for(let i = 0; i < qntSelected; i++){
    if( medicamentosJson[i].quantidade < quantidade){
      qntValida = false
      res.render('add/pacienteAdd', {erro: `Temos menos comprimidos de ${nome} do que necessario!`})
      return
    }  
    console.log(medicamentosJson[i].quantidade)
    medicamentosJson[i].quantidade = medicamentosJson[i].quantidade - quantidade
    await updateJSON(medicamentosJson, 'medicamentos.json')
    const medicamentoInfo = { remedio, quantidade: `${quantidade[i]} comprimidos`, tempo} 
    medicamentos.push(medicamentoInfo)
  }

  if(qntValida){ 
  const newPaciente = {id, nome, idade, medicamentos}

  const pacientesJson = await readJSON('pacientes.json')
  pacientesJson.push(newPaciente)
  await updateJSON(pacientesJson, 'pacientes.json')
  console.log('>> paciente registrado. id: ' + id)
  
  res.redirect('/pacientes')}}
)

// medicamentos 

app.get('/medicamentos', async (req, res) =>{
  const medicamentos = await readJSON('medicamentos.json')
  res.render('medicamentos', { medicamentos })
})

app.post('/medicamentos/delete', async(req, res) => {
  const medicamentos = await readJSON('medicamentos.json')
  const id = req.body.id

  const item = medicamentos.findIndex(medicamento => medicamento.id == id)
  medicamentos.splice(item, 1)
  updateJSON(medicamentos, 'medicamentos.json')
  console.log('>> medicamento deletado id: ' + id)
  res.redirect('/medicamentos')
});

app.get('/medicamentos/add', (req, res) => {
  res.render('add/medicamentoAdd')
})

app.post('/medicamentos/add', async (req, res) => {

  const nome = req.body.medicamento
  const quantidade = parseInt(req.body.quantidade)
  const id = await createId('pacientes.json')

  
  
  const newMedicamento = { id, nome, quantidade }

  const medicamentosJson = await readJSON('medicamentos.json')
  medicamentosJson.push(newMedicamento)
  await updateJSON(medicamentosJson, 'medicamentos.json')
  console.log('>> medicamento registrado. id: ' + id)
  
  res.redirect('/medicamentos')
})
  
app.post('/medicamentos/edit/:id', async(req, res) => {
  const medicamentos = await readJSON('medicamentos.json')
  const id = req.params.id 

  const medicamento = medicamentos.findIndex(medicamento => medicamento.id == id)


  res.render('edit/edit', { medicamento: medicamentos[medicamento] })


})

app.post('/medicamentos/edit', async(req, res) => {
  const medicamentosJson = await readJSON('medicamentos.json')

  const nome = req.body.medicamento
  const quantidade = parseInt(req.body.quantidade)
  const id = req.body.id

  const newMedicamento = { id, nome, quantidade }
  const medicamento = medicamentosJson.findIndex(medicamento => medicamento.id == id)
  medicamentosJson[medicamento] = newMedicamento

  await updateJSON(medicamentosJson, 'medicamentos.json')
  console.log('>> medicamento atualizado. id: ' + id)
  
  res.redirect('/medicamentos')


})

// filter 

app.post('/filter', async(req, res) => {
  const search = req.body.filter
  const pacientes = await readJSON('pacientes.json')
  const medicamentos = await readJSON('medicamentos.json')

  if(searchJson(pacientes, search)){
    const pacientesFiltrados = pacientes.filter(paciente => Object.values(paciente).includes(search));
    res.render('pacientes', { pacientes: pacientesFiltrados})
  } 
  else if(searchJson(medicamentos, search)){
    const medicamentosFiltrados = medicamentos.filter(medicamento => Object.values(medicamento).includes(search));
    res.render('medicamentos', { medicamentos: medicamentosFiltrados})
  }else{
    res.redirect('/')
  }
})

app.listen(3000, () => {
  console.log('>> server on')
})



async function readJSON(file) {
  const filePath = path.join(__dirname, 'public/json', file);
  const data = await fs.readFile(filePath, 'utf8') // podia estar dando readFileSync, mas fica mais clean assim sem os callback
  return JSON.parse(data)
}

async function updateJSON(json, path) {
  try {
    const filePath = `public/json/${path}`;
    const jsonData = JSON.stringify(json, null, 2); // Formatar bonitinho no JSON, só estetica
    await fs.writeFile(filePath, jsonData);
    console.log('>> json atualizado');
  } catch (error) {
    console.error('>> json err: ', error);
  }
}

function searchJson(json, nome){
  return json.find((data) => {
    return data.nome == nome;
  });
}


async function createId(arquivo, id = 1){ // top 10 porquices minha mas funciona esquece o clean code, feio é nao funcionar
  const json = await readJSON(arquivo)
  for(el of json){ 
    if(id == el.id){
      ++id
      return createId(arquivo, id)
    }
   
  }
  return parseInt(id)
  }
  