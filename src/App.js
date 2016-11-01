import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FileReaderInput from 'react-file-reader-input';
import './App.css';
import { Tab, Tabs, ListGroupItem, ListGroup, Button, FormGroup, FormControl, } from 'react-bootstrap';

function processText(text) {
  const uniq = (list) => {
    return list.filter((v, i, a) => a.indexOf(v) === i).sort()
  }
  // Hacking to help with existig log files...
  var addresses = uniq((text.match(/ [13][a-km-zA-HJ-NP-Z1-9]{25,34}/g) || []).map((m) => m.replace(/\W+/, "")))
  return {
    transactions:[], addresses: addresses, log: [text]
  }
}

class TransactionPane extends Component {
  render() {
    var txs = this.props.transactions;
    return (
      <div className="Transactions">
        {(txs.length === 0 && <h3>No transactions found.</h3>)}
        <ListGroup>
          {txs.map((t, index) => {
            var url = 'https://blockexplorer.com/tx/' + t
            return (<ListGroupItem key={index} href={url}>{t}</ListGroupItem>)
          })}
        </ListGroup>
      </div>
    )
  }
}

class AddressPane extends Component {
  render() {
    var addrs = this.props.addresses;
    return (
      <div className="Addresses">
        {(addrs.length === 0 && <h3>No addresses found.</h3>)}
        <ListGroup>
          {addrs.map((a, index) => {
            var url = 'https://blockexplorer.com/address/' + a
            return (<ListGroupItem key={index} href={url}>{a}</ListGroupItem>)
          })}
        </ListGroup>
      </div>
    )
  }
}

class LogPane extends Component {
  render() {
    return (
      <div className="Logs"><pre>{this.props.log.join("\n")}</pre></div>
    )
  }
}

const tabsInstance = (data) => {
  return (
    <div className="Main">
      <Tabs defaultActiveKey={1} id="navigation-tabs">
        <Tab eventKey={1} title="Log"><LogPane log={data.log} /></Tab>
        <Tab eventKey={2} title="Addresses"><AddressPane addresses={data.addresses} /></Tab>
        <Tab eventKey={3} title="Transactions"><TransactionPane transactions={data.transactions} /></Tab>
      </Tabs>
    </div>
  )
}

class LogLoader extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClear = this.handleClear.bind(this)
    this.handleNewFiles = this.handleNewFiles.bind(this)
    this.handleDroppedFiles = this.handleDroppedFiles.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
  }

  componentDidMount() {
    var dropZone = ReactDOM.findDOMNode(this.refs.dropZone)
    dropZone.addEventListener('dragover', this.handleDragOver, false);
    dropZone.addEventListener('drop', this.handleDroppedFiles, false);
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Loader">
        <form>
          <div className="DropZone" ref="dropZone">Drop files here</div>
          <div className="Or"> or </div>
          <div className="FileSelector">
            <FileReaderInput id="file-input" onChange={this.handleNewFiles}>
              <Button>Select a file</Button>
            </FileReaderInput>
          </div>
          <div className="Or"> or </div>
          <FormGroup controlId="formControlsTextarea">
            <FormControl ref="raw" componentClass="textarea" placeholder="Copy & Paste logfile contents here..." />
          </FormGroup>
          <Button type="button" onClick={this.handleSubmit}>Submit</Button>
          &nbsp;
          <Button type="button" className="btn-default" onClick={this.handleClear}>Clear</Button>
        </form>
      </div>)
  }
  handleDragOver(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  handleDroppedFiles(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    for (var i = 0, f; f = files[i]; i++) {
      this.processFile(files[i])
    }
  }
  handleNewFiles(e, results) {
    results.forEach(result => {
      const [e, file] = result;
      this.processFile(file);
    })
  }
  processFile(file) {
    var that = this;
    var reader = new FileReader();
    reader.onload = ((file) => {
      return function(e) {
        that.props.onReceive(processText(e.target.result));
      }
    })(file);
    reader.readAsText(file);
  }
  handleSubmit() {
    var element = ReactDOM.findDOMNode(this.refs.raw);
    try {
      var json = JSON.parse(element.value)
      this.props.onReceive(json)
    } catch (e) {
      this.props.onReceive(processText(element.value));
    }
    return false
  }
  handleClear() {
    ReactDOM.findDOMNode(this.refs.raw).value = ''
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { data: null }
    this.handleData = this.handleData.bind(this);
    this.clearData = this.clearData.bind(this);
  }
  render() {
    return (
      <div className="container">
        <h2>Log Viewer
          {(this.state.data && <Button bsSize="small" className="pull-right" onClick={this.clearData}>Clear</Button>)}
        </h2>
        {(this.state.data && tabsInstance(this.state.data))}
        {(!this.state.data && <LogLoader className="Loader" onReceive={this.handleData} />)}
      </div>
    );
  }
  handleData(data) {
    this.setState({data:data})
  }
  clearData() {
    this.setState({data:null})
  }
}

export default App;
