import {AfterViewInit, Component} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {AccountHttp, Address, NEMLibrary, NetworkTypes, TransferTransaction, Transaction} from 'nem-library';
import APP_CONFIG from './app.config';
import {Node, Link} from './d3';
import {forEach} from '@angular/router/src/utils/collection';
import {MyStorageService} from './storage.service';
import {ForceDirectedGraph} from './d3/models';
import {GraphComponent} from './visuals/graph/graph.component';

NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit {
  nodes: Node[] = [];
  links: Link[] = [];
  title = 'NEM NETWORK NEON';
  walletId: string = 'NBZNQL2JDWTGUAW237PXV4SSXSPORY43GUSWGSB7';
  submittedId: string;
  outputs: string = 'start';
  private static indexMap = {};//ここは一意なので、Mapゆうこう
  amounts = [];
  isViewerMode = false;
  private static signerRecipient = [];
  findingNum = 0;
  downloadMessage = 'Downloading Tasks ...';

  constructor() {
    let localData = MyStorageService.prototype.fetch();
    console.log('localData');
    console.log(localData);
    if (localData.length > 0) {
      console.log('find data!');
      AppComponent.signerRecipient = localData;
      this.signerRecipientToNodes();
      this.signerRecipientToLinks();
      this.isViewerMode = true;
    }

  }

  pushToNode(label) {
    console.log('pushToNode!!');
    this.nodes.push(new Node(this.nodes.length + 1, label));
    AppComponent.indexMap[label] = this.nodes.length;
    console.log(AppComponent.indexMap);
    console.log(this.nodes);

  }

  pushToLink(signer, recipient) {
    console.log('pushToLink!!');
    /** increasing connections toll on connecting nodes */
    this.nodes[AppComponent.indexMap[signer] - 1].linkCount++;
    this.nodes[AppComponent.indexMap[recipient] - 1].linkCount++;

    /** connecting the nodes before starting the simulation */
    this.links.push(new Link(AppComponent.indexMap[signer], AppComponent.indexMap[recipient]));
    console.log(this.links);

  }


  initNodeLink() {
    this.nodes = [];
    this.links = [];
    AppComponent.indexMap = {};
  }


  onSubmitClick() {
    if (this.isViewerMode) {
      return;
    }

    this.submittedId = this.walletId;
    this.getFriendRelation(this.submittedId, 10, 1);
    console.log('AMOUNTS' + this.amounts.toString());
    document.getElementById('downloadMessage').style.display = 'block';
  }

  addFindingNum() {
    this.findingNum += 1;
    this.updateDownloadingMessage();
  }

  reduceFindingNum() {
    this.findingNum -= 1;
    this.updateDownloadingMessage();
  }

  updateDownloadingMessage() {
    if (this.findingNum > 0) {
      this.downloadMessage = 'Searching Tasks ... ' + this.findingNum;
      return;
    }
    this.downloadMessage = 'Finish! Please push SHOW_GRAPH button';

  }

  getFriendRelation(centralAdressString, ceilingNum, distance) {
    this.addFindingNum();
    let distanceNum = 2;
    const accountHttp: AccountHttp = new AccountHttp();
    const centerAddress: Address = new Address(centralAdressString);
    const pagedTransactions = accountHttp.allTransactionsPaginated(centerAddress, undefined);
    let friends = [];
    pagedTransactions.subscribe(x => {
      x.forEach(function (value) {
        let temp = value as TransferTransaction;
        try {
          //TransferTransactionのみを対象
          if (temp.recipient && temp.constructor === TransferTransaction && temp.recipient.value != temp.signer.address.value) {
            console.log(temp.signer.address.value);
            console.log(temp.recipient.value);
            console.log(temp._xem.amount);
            AppComponent.addUniqueSignerRecipient(temp.signer.address.value, temp.recipient.value);

            if (friends.indexOf(temp.recipient.value) < 0 && centralAdressString != temp.recipient.value) {
              friends.push(temp.recipient.value);
            }
            if (friends.indexOf(temp.signer.address.value) < 0 && centralAdressString != temp.signer.address.value) {
              friends.push(temp.signer.address.value);
            }
          }
        } catch {
          //Nothing to do
        }
      });
      if (friends.length < ceilingNum) {
        console.log('friends.length');
        console.log(friends.length);
        pagedTransactions.nextPage();
      } else {
        this.reduceFindingNum();
        if (distance < distanceNum) {
          for (let num in friends) {
            this.getFriendRelation(friends[num], 10, distance + 1);
          }
        }
      }
    }, err => {
      console.log(err);
    }, () => {
      console.log('complete');
      this.reduceFindingNum();
      if (distance < distanceNum) {
        for (let num in friends) {
          this.getFriendRelation(friends[num], 10, distance + 1);
        }
      }
      // this.signerRecipientToNodes();
    });
  }


  private static addUniqueSignerRecipient(newSigner, newRecipient) {
    let isPush = true;
    AppComponent.signerRecipient.filter(function (pair) {
      if (pair[0] == newSigner && pair[1] == newRecipient) {
        isPush = false;
      }
    });
    if (isPush) {
      AppComponent.signerRecipient.push([newSigner, newRecipient]);
    }
    return;
  }

  signerRecipientToNodes() {
    for (let index_sr in AppComponent.signerRecipient) {
      let item = AppComponent.signerRecipient[index_sr];
      let signer = item[0];
      let recipient = item[1];
      if (!(signer in AppComponent.indexMap)) {
        this.pushToNode(signer);
      }
      if (!(recipient in AppComponent.indexMap)) {
        this.pushToNode(recipient);
      }


    }

  }

  signerRecipientToLinks() {
    for (let index_sr in AppComponent.signerRecipient) {
      let item = AppComponent.signerRecipient[index_sr];
      let signer = item[0];
      let recipient = item[1];

      this.pushToLink(signer, recipient);
    }
  }

  saveAndReload() {
    this.saveLocal();
    location.reload();
  }

  clearAndReload() {
    this.clearLocal();
    location.reload();
  }

  saveLocal() {
    MyStorageService.prototype.add(AppComponent.signerRecipient);
  }

  clearLocal() {
    MyStorageService.prototype.clear();
  }

  initGraph() {
    GraphComponent.prototype.refreshSimulation();
  }

  ngAfterViewInit() {
    if (this.isViewerMode) {
      document.getElementById('network_graph').style.display = 'block';
      document.getElementById('initial_form').style.display = 'none';
      document.getElementById('mainBody').style.backgroundImage = '';
    }
  }
}

