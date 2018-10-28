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
  title = 'NEM NETWORK';
  walletId: string;
  submittedId: string;
  chainList = [1, 2, 3, 4];
  chainNum;
  spokeList = [5, 10, 15];
  spokeNum;
  outputs: string = 'start';
  private static indexMap = {};//ここは一意なので、Mapゆうこう
  amounts = [];
  isViewerMode = false;
  private static signerRecipient = [];
  findingNum = 0;
  downloadMessage = 'Downloading Tasks ...';
  nodeEdgeData;
  nodeRawText = '';
  private static colorIndexMap = {};
  highlightWalletId: string;
  submittedHighlightWalletId: string;

  constructor() {
    let localData = MyStorageService.prototype.fetch();
    // console.log('localData');
    // console.log(localData);
    if (localData.length > 0) {
      // console.log('find data!');
      AppComponent.signerRecipient = localData[0];
      this.nodeEdgeData = localData[0];
      AppComponent.colorIndexMap = localData[1];
      console.log(AppComponent.colorIndexMap);
      this.signerRecipientToNodes();
      this.signerRecipientToLinks();
      this.isViewerMode = true;
    }

  }

  pushToNode(label) {
    // console.log('pushToNode!!');
    this.nodes.push(new Node(this.nodes.length + 1, label, AppComponent.colorIndexMap[label]));
    AppComponent.indexMap[label] = this.nodes.length;
    // console.log(AppComponent.indexMap);
    // console.log(this.nodes);

  }

  pushToLink(signer, recipient) {
    // console.log('pushToLink!!');
    /** increasing connections toll on connecting nodes */
    this.nodes[AppComponent.indexMap[signer] - 1].linkCount++;
    this.nodes[AppComponent.indexMap[recipient] - 1].linkCount++;

    /** connecting the nodes before starting the simulation */
    this.links.push(new Link(AppComponent.indexMap[signer], AppComponent.indexMap[recipient]));
    // console.log(this.links);

  }


  initNodeLink() {
    this.nodes = [];
    this.links = [];
    AppComponent.indexMap = {};
  }


  onSubmitClick() {
    // console.log(this.spokeNum);
    if (this.isViewerMode) {
      return;
    }
    this.submittedId = this.walletId;
    this.submittedHighlightWalletId = this.highlightWalletId;
    this.getFriendRelation(this.submittedId, this.spokeNum, 1, this.chainNum, this.submittedHighlightWalletId);
    // console.log('AMOUNTS' + this.amounts.toString());
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

  getFriendRelation(centralAdressString, ceilingNum, distance, maxDistance, highlight) {
    if (!AppComponent.colorIndexMap[centralAdressString]) {
      AppComponent.colorIndexMap[centralAdressString] = this.getColorGrade(distance);
    }
    this.addFindingNum();
    let distanceNum = maxDistance;
    const accountHttp: AccountHttp = new AccountHttp([
      {protocol: 'https', domain: 'aqualife1.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'aqualife2.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'aqualife3.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'beny.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'mnbhsgwbeta.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'mnbhsgwgamma.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'nemstrunk.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'nemstrunk2.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'nsm.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'kohkei.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'mttsukuba.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'pegatennnag.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'qora01.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'shibuya.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'strategic-trader-1.supernode.me', port: 7891}, {
        protocol: 'https',
        domain: 'strategic-trader-2.supernode.me',
        port: 7891
      }, {protocol: 'https', domain: 'thomas1.supernode.me.supernode.me', port: 7891},
    ]);
    const centerAddress: Address = new Address(centralAdressString);
    const pagedTransactions = accountHttp.allTransactionsPaginated(centerAddress, undefined);
    let friends = [];
    pagedTransactions.subscribe(x => {
      x.forEach(function (value) {
        let temp = value as TransferTransaction;
        try {
          //TransferTransactionのみを対象
          if (temp.recipient && temp.constructor === TransferTransaction && temp.recipient.value != temp.signer.address.value) {
            // console.log(temp.signer.address.value);
            // console.log(temp.recipient.value);
            // console.log(temp._xem.amount);
            AppComponent.addUniqueSignerRecipient(temp.signer.address.value, temp.recipient.value);

            if (friends.indexOf(temp.recipient.value) < 0 && centralAdressString != temp.recipient.value) {
              // console.log('NEW FRIEND');
              friends.push(temp.recipient.value);
              AppComponent.prototype.addNewFriendColor(temp.recipient.value, distance, highlight);
            }
            if (friends.indexOf(temp.signer.address.value) < 0 && centralAdressString != temp.signer.address.value) {
              // console.log('NEW FRIEND');
              friends.push(temp.signer.address.value);
              AppComponent.prototype.addNewFriendColor(temp.signer.address.value, distance, highlight);
            }
          }
        } catch {
          //Nothing to do
        }
      });
      if (friends.length < ceilingNum) {
        // console.log('friends.length');
        // console.log(friends.length);
        pagedTransactions.nextPage();
      } else {
        this.reduceFindingNum();
        if (distance < distanceNum) {
          for (let num in friends) {
            this.getFriendRelation(friends[num], 15, distance + 1, distanceNum, highlight);
          }
        }
      }
    }, err => {
      // console.log(err);
    }, () => {
      // console.log('complete');
      this.reduceFindingNum();
      if (distance < distanceNum) {
        for (let num in friends) {
          this.getFriendRelation(friends[num], 15, distance + 1, distanceNum, highlight);
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

  showRawData() {
    let nodeRawTemp = 'The data below is a list of combinations of trading nodes from past transfer transactions.' + '\n' + '[node1,node2], ' + '\n' + '[node1, node3]...';
    this.nodeEdgeData.forEach(function (value) {
      // console.log('functions');
      // console.log(value);
      nodeRawTemp = nodeRawTemp + '["' + value[0] + '","' + value[1] + '"];' + '\n';
    });
    this.nodeRawText = nodeRawTemp;
    document.getElementById('network_graph').style.display = 'none';
  }

  saveLocal() {
    MyStorageService.prototype.add([AppComponent.signerRecipient, AppComponent.colorIndexMap]);
  }

  clearLocal() {
    MyStorageService.prototype.clear();
  }

  initGraph() {
    GraphComponent.prototype.refreshSimulation();
  }

  //色の上書きをされないように
  addNewFriendColor(address, distance, highlight) {
    if (!AppComponent.colorIndexMap[address]) {
      // console.log('ADD COLOR' + address + AppComponent.prototype.getColorGrade(distance + 1));
      console.log(address);
      if (address == highlight) {
        console.log('Yeah');
        AppComponent.colorIndexMap[address] = AppComponent.prototype.getColorGrade(-1);
        return;
      }
      AppComponent.colorIndexMap[address] = AppComponent.prototype.getColorGrade(distance + 1);
    }
  }

  getColorGrade(grade) {
    switch (grade) {
      case -1:
        return 'rgb(0, 0, 255)';
      case 1:
        return 'rgb(237, 170, 59)';
      case 2:
        return 'rgb(85,193,179)';
      case 3:
        return 'rgb(118, 177, 227)';
      case 4:
        return 'rgb(118, 177, 227)';
      default:
        return 'rgb(118, 177, 227)';
    }
  }

  ngAfterViewInit() {
    if (this.isViewerMode) {
      document.getElementById('network_graph').style.display = 'block';
      document.getElementById('initial_form').style.display = 'none';
      document.getElementById('mainBody').style.backgroundImage = '';
    }
  }
}

