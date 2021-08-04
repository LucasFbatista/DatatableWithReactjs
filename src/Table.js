import React, { Component } from 'react';


import './Utils/datatable/css/dataTables.bootstrap4.css'
import './Utils/datatable/css/fontawesome_all.css'
import './Utils/datatable/css/style.css'
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'react-xdsoft-datetimepicker'
import { saveAs } from 'file-saver';

const axios = require("axios");
const $ = require('jquery');
$.DataTable = require( 'datatables.net-bs4');

const styleDiv = {

  display: 'none'
}

const currentDatetime = new Date().toLocaleString();

function format(d){
     return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px; margin: 0 auto;">' +
                '<tr>' +
                    '<td class="font-weight-bold">Marca Veiculo:</td>' +
                    '<td>'+ d.marcaCarro +'</td>' +
                    '<td class="font-weight-bold">Modelo veiculo:</td>' +
                    '<td>'+ d.modeloCarro +'</td>' +
                    '<td class="font-weight-bold">Cor Veiculo:</td>' +
                    '<td>'+ d.corCarro +'</td>' +
                '</tr>' +
                '<tr>' +
                    '<td class="font-weight-bold">Forma de Pagamento:</td>' +
                    '<td>' + d.formaPgto + '</td>' +
                    '<td class="font-weight-bold">Endereço:</td>' +
                    '<td>' + d.endereco + '</td>' +
                    '<td class="font-weight-bold">Condominio:</td>' +
                    '<td>'+ d.razaoCondominio +'</td>' +
                '</tr>' +
                '<tr>' +
                    '<td class="font-weight-bold">Data Gravação:</td>' +
                    '<td>'+ convertDate(d.dataHora) +'</td>' +
                    '<td class="font-weight-bold">E-mail:</td>' +
                    '<td>'+ d.email +'</td>' +
                    '<td class="font-weight-bold">Gravação Cbill:</td>' +
                    '<td>'+ FormatCbill(d.cbill) +'</td>' +
                '</tr>' +
             '</table>';  
}

function FormatCbill(data) {
  if(data === 0){
    return "Não"
  }else{
    return "Sim"
  }
}
function convertDate(datahora){

  var dttime_year = datahora.substr(0,4);
  var dttime_month = datahora.substr(5,2);
  var dttime_day = datahora.substr(8,2);
  var dttime_hour = datahora.substr(11,2);
  var dttime_min = datahora.substr(14,2);
  return dttime_day+'/'+dttime_month+'/'+dttime_year+' '+dttime_hour+':'+dttime_min;

}
export class Table extends Component {


    componentDidMount(){

      $.datetimepicker.setLocale('pt');
      $('#datetimepicker').datetimepicker({
          value:currentDatetime,
          format:'d/m/Y H:i',
      });
      $('#datetimepicker2').datetimepicker({
        value:currentDatetime,
        format:'d/m/Y H:i'
      }); 
    }

    componentWillUnmount(){
      this.$el.DataTable.destroy(true)
    }

    exportCsvPassages = () => {

      var dateTime1 = document.getElementById("datetimepicker").value;
      var dateTime2 = document.getElementById("datetimepicker2").value;
      var cdlocal = document.getElementById("cdlocal").value;
      var dispo = document.getElementById("disp").value;

      Swal.fire({
        title: 'Processando...'
      });
      Swal.showLoading();

      const baseAddress = "https://localhost:44318/api/transaction/exportfile?";
      axios.get(baseAddress, {
        params:{
          dttimeini:dateTime1,
          dttimefin:dateTime2,
          dispositivo:cdlocal,
          codigoLocal:dispo
        }
      }).then(function (response) {
        
        var blob = new Blob([response.data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "Transacoes.csv");
        Swal.close();
        
      }).catch(function (error) {
        Swal.close();
        console.log(error)
      }); 
    }

    exportCsvRegisters = () => {

      const condominio = document.getElementById("cdgCond").value;
      const integradora = document.getElementById("integ").value;

      Swal.fire({
        title: 'Processando...'
      });
      Swal.showLoading();

      const baseAddress = "https://localhost:44318/api/register/exportfile?";
      axios.get(baseAddress, {
        params:{
          cdCond:condominio,
          nomeInteg:integradora
        }
      }).then(function (response) {

        var blob = new Blob([response.data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "Registros.csv");
        Swal.close();
        
      }).catch(function (error) {
        Swal.close();
        console.log(error);
      });
    }

    searchPassages = (e) => {
      e.preventDefault();

      //SWET ALERT TIMER REQUEST
      let timerInterval
      Swal.fire({
        title: 'Por favor Aguarde o Termino da solicitação!',
        html: 'Irei fechar automaticamente em alguns Segundos.',
        timer: 5000,
          onBeforeOpen: () => {
              Swal.showLoading()
              timerInterval = setInterval(() => {
              const content = Swal.getContent()
              if (content) {
                  const b = content.querySelector('b')
                  if (b) {
                  b.textContent = Swal.getTimerLeft()
                  }
              }
              }, 8000)
          },
          onClose: () => {
              clearInterval(timerInterval)
              Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: 'Solicitação realizada com Sucesso',
                  showConfirmButton: false,
                  timer: 4000
              }); 
          }
      }).then((result) => {

        if (result.dismiss === Swal.DismissReason.timer) {
            console.log('Success')
        }
      })

      this.$tablePassages = $(this.tablePassages)
      var table = this.$tablePassages.DataTable({

          "processing": true,
          "serverSide": true,
          "select":"single",
          "ajax": {
            "url": "https://localhost:44318/api/transaction/getfilter?dttimeini=01/09/2020 11:49&dttimefin=29/09/2020 11:49",
            "type": "POST",
            "contentType": "application/json",
            "dataType": "json",
            data: function (d) {
              return JSON.stringify(d);
            },
            error: function (errors) {
              console.log(errors)
            }
          },
          "paging": true,
          "ordering": true,
          "info": true,
          "searching": { regex: true },
          "responsive": true,
          "pageLength": 10,
          "columns": [
            {
              "className": 'details-control',
              "orderable": false,
              "data": null,
              "defaultContent": '',
              "render": function () {
                  return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
              },
              "width":"15px"
            },
            { data: "id" },
            { data: "dataHora"},
            { data: "codigoLocal" },
            { data: "dispositivo" },
            { data: "numeroPista" },
            { data: "controle" }
          ],
          "columnDefs": [
            {
              targets: 2,
              render: function (data) {
                  return convertDate(data)
              },
            },
          ],
          "order": [[2, "asc"]],
          "language": {
            "decimal": "",
            "emptyTable": "Nenhum dado para ser exibido",
            "info": "Exibindo _START_ para _END_ de _TOTAL_ registros",
            "infoEmpty": "Exibindo 0 para 0 de 0 registros",
            "infoFiltered": "(Filtrado de _MAX_ Total Registros)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Exibir _MENU_ registros",
            "loadingRecords": "Carregando...",
            "processing": '<i class="fas fa-spinner fa-pulse fa-4x"></i',
            "search": "Pesquisar:",
            "zeroRecords": "Nenhum dado pesquisado encontrado",
            "paginate": {
              "first": "Primeiro",
              "last": "Último",
              "next": "Próximo",
              "previous": "Anterior"
            },
            "aria": {
              "sortAscending": ": activate to sort column ascending",
              "sortDescending": ": activate to sort column descending"
            }
          }
        });
        $('#datatable2 tbody').on('click', 'td.details-control', function () {
          var tr = $(this).closest('tr');
          var tdi = tr.find("i.fa");
          var row = table.row(tr);
          row.child.hide();
          tr.removeClass('shown');
          tdi.first().removeClass('fa-minus-square');
          tdi.first().addClass('fa-plus-square');
      });
  
      table.on("user-select", function (e, dt, type, cell, originalEvent) {
          if ($(cell.node()).hasClass("details-control")) {
              e.preventDefault();
          }
      });
    }

    searchRegisters = (e) => {
      e.preventDefault();

       //SWET ALERT TIMER REQUEST
       let timerInterval
       Swal.fire({
         title: 'Por favor Aguarde o Termino da solicitação!',
         html: 'Irei fechar automaticamente em alguns Segundos.',
         timer: 5000,
           onBeforeOpen: () => {
               Swal.showLoading()
               timerInterval = setInterval(() => {
               const content = Swal.getContent()
               if (content) {
                   const b = content.querySelector('b')
                   if (b) {
                   b.textContent = Swal.getTimerLeft()
                   }
               }
               }, 8000)
           },
           onClose: () => {
               clearInterval(timerInterval)
               Swal.fire({
                   position: 'center',
                   icon: 'success',
                   title: 'Solicitação realizada com Sucesso',
                   showConfirmButton: false,
                   timer: 4000
               }); 
           }
       }).then((result) => {
 
         if (result.dismiss === Swal.DismissReason.timer) {
             console.log('Success')
         }
       })

      this.$tableRegisters = $(this.tableRegisters)
      var table = this.$tableRegisters.DataTable({

          "processing": true,
          "serverSide": true,
          "select":"single",
          "ajax": {
            "url": "https://localhost:44318/api/register/getfilter?nomeInteg=WNTECNOLOGIA",
            "type": "POST",
            "contentType": "application/json",
            "dataType": "json",
            data: function (d) {
              return JSON.stringify(d);
            },
            error: function (errors) {
              console.log(errors)
            }
          },
          "paging": true,
          "ordering": true,
          "info": true,
          "searching": { regex: true },
          "responsive": true,
          "pageLength": 10,
          "columns": [
            {
              "className": 'details-control',
              "orderable": false,
              "data": null,
              "defaultContent": '',
              "render": function () {
                  return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
              },
              "width":"15px"
            },
            { data: "id" },
            { data: "nome"},
            { data: "cpf" },
            { data: "rg" },
            { data: "telefone" },
            { data: "placa" },
            { data: "codigoCondominio" },
            { data: "tag" },
            { data: "nomeIntegradora" }
          ],
          "columnDefs": [
            {
              targets: 5,
              render: function (data) {
                const phone = data.replace(/([^\d])+/gim, '');
                return phone
              },
            },
            {
              targets: 4,
              render: function (data) {
                const rg = data === "" ? "DEFAULT" : data
                return rg
              },
            }
          ],
          "order": [[9, "asc"]],
          "language": {
            "decimal": "",
            "emptyTable": "Nenhum dado para ser exibido",
            "info": "Exibindo _START_ para _END_ de _TOTAL_ registros",
            "infoEmpty": "Exibindo 0 para 0 de 0 registros",
            "infoFiltered": "(Filtrado de _MAX_ Total Registros)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Exibir _MENU_ registros",
            "loadingRecords": "Carregando...",
            "processing": '<i class="fas fa-spinner fa-pulse fa-4x"></i',
            "search": "Pesquisar:",
            "zeroRecords": "Nenhum dado pesquisado encontrado",
            "paginate": {
              "first": "Primeiro",
              "last": "Último",
              "next": "Próximo",
              "previous": "Anterior"
            },
            "aria": {
              "sortAscending": ": activate to sort column ascending",
              "sortDescending": ": activate to sort column descending"
            }
          }
        });

      $('#datatable1 tbody').on('click', 'td.details-control', function () {
          var tr = $(this).closest('tr');
          var tdi = tr.find("i.fa");
          var row = table.row(tr);

          if (row.child.isShown()) {
              // This row is already open - close it
              row.child.hide();
              tr.removeClass('shown');
              tdi.first().removeClass('fa-minus-square');
              tdi.first().addClass('fa-plus-square');
          }
          else {
              // Open this row
              row.child(format(row.data())).show();
              tr.addClass('shown');
              tdi.first().removeClass('fa-plus-square');
              tdi.first().addClass('fa-minus-square');
          }
      });

      table.on("user-select", function (e, dt, type, cell, originalEvent) {
          if ($(cell.node()).hasClass("details-control")) {
              e.preventDefault();
          }
      });    
    }
    showRegisters = () => {
      $('.hscadastro').show();
      $('#tableRegisters').show();
      $('.hscontrole').hide()
      $('#PassagesBtn').hide()
      $('#datatable2').DataTable().clear().draw();
      $('#datatable2_wrapper').hide()
    }

    render() {

        return  <div className = "container mt-5">
                    <div className="table-wrapper table-responsive-xl">
                        <div className="table-title">
                            <div className="row">
                                <div className="col-sm">
                                    <div className="badg-check-container"> 
                                        <h2 className="mb-3">Relatório de Registros</h2>
                                            <label className="mr-4 Cdt"><input type="radio" id="cadastro" className="option-input radio" name="example" onClick={this.showRegisters}/> Cadastros </label>
                                            <label className="Access"><input type="radio" className="option-input radio" id="ctracesso" name="example" defaultChecked onClick={() => window.location.reload(true)}/> Controle de Acesso </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center mb-5 mt-5 hscontrole">
                          <div className="col-sm-12 col-md-10 col-lg-8">
                            <form>
                              <div className="form-row">
                                <div className="form-group col-sm-6">
                                  <label htmlFor="name">Data Inicial:</label>
                                  <input type="text" className="form-control" id="datetimepicker" placeholder="00/00/0000 00:00" />
                                </div>
                                <div className="form-group col-sm-6">
                                  <label htmlFor="email">Data Final:</label>
                                  <input type="text" className="form-control" id="datetimepicker2" placeholder="00/00/0000 00:00" />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="form-group col-sm-6">
                                  <label htmlFor="name">Código Local:</label>
                                  <input type="number"className="form-control" id="cdlocal" placeholder="Buscar" />
                                </div>
                                <div className="form-group col-sm-6">
                                  <label htmlFor="email">Dispositivo:</label>
                                  <input type="text" className="form-control" id="disp" placeholder="Buscar" />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="col-sm-12">
                                    <button className="btn bg-success text-light" onClick={this.searchPassages}>Pesquisar</button>
                                </div>
                             </div>
                            </form>
                          </div>
                        </div>
                        <div className="row justify-content-center mb-5 mt-5 hscadastro" style={styleDiv}>
                          <div className="col-sm-12 col-md-10 col-lg-8">
                            <form>
                              <div className="form-row">
                                <div className="form-group col-sm-6">
                                  <label htmlFor="name">Código Condominio:</label>
                                  <input type="number" className="form-control" id="cdgCond" placeholder="Buscar"/>
                                </div>
                                <div className="form-group col-sm-6">
                                  <label htmlFor="email">Integradora:</label>
                                  <input type="text" className="form-control" id="integ" placeholder="Buscar" />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="col-sm-12">
                                    <button className="btn bg-success text-light" onClick={this.searchRegisters}>Pesquisar</button>
                                </div>
                             </div>
                            </form>
                          </div>
                        </div>
                        <div id="tablePassages">
                          <button type="button" className="btn bg-info text-light" onClick={this.exportCsvPassages} id="PassagesBtn">Baixar Todos <i className="fas fa-file-download"></i></button>
                            <table className="table table-striped table-bordered responsive" width = "100%" ref = { tablePassages => this.tablePassages = tablePassages } id="datatable2">
                                <thead>
                                    <tr>
                                    <th><center><h4>+</h4></center></th>
                                        <th>Id</th>
                                        <th>Data Hora</th>
                                        <th>Código Local</th>
                                        <th>Dispositivo</th>
                                        <th>Número Pista</th>
                                        <th>Controle</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div style={styleDiv} id="tableRegisters">
                          <button type="button" className="btn bg-info text-light" onClick={this.exportCsvRegisters} id="RegistersBtn">Baixar Todos <i className="fas fa-file-download"></i></button>
                            <table className="table table-striped table-bordered responsive" width = "100%" id="datatable1" ref = { tableRegisters => this.tableRegisters = tableRegisters }>
                              <thead>
                                  <tr>  
                                      <th><center><h4>+</h4></center></th>
                                      <th>Id</th>
                                      <th>Nome</th>
                                      <th>CPF</th>
                                      <th>RG</th>
                                      <th>Telefone</th>
                                      <th>Placa</th>
                                      <th>Codigo Condominio</th>
                                      <th>Tag</th>
                                      <th>Integradora</th>
                                  </tr>
                              </thead>
                            </table>
                        </div>
                    </div>  
                </div>
    }
}

export default Table