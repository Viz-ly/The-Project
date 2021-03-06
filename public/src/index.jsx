import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import TripSummary from './components/TripSummary.jsx';
import Friends from './components/Friends.jsx';
import CreateTrip from './components/CreateTrip.jsx';
import Itemization from './components/Itemization.jsx';
import UploadReceipt from './components/Upload.jsx';
import MemberSummary from './components/MemberSummary.jsx';
import ReceiptSummary from './components/ReceiptSummary.jsx';
import Breakdown from './components/Breakdown.jsx';
import Profile from './components/Profile.jsx';
import Login from './components/Login.jsx';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PrivateRouteHome from './components/PrivateRouteHome.jsx';
import Util from './lib/util.js';
import CreateItem from './components/CreateItem.jsx';
import $ from 'jquery';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      receiptUrl: '',
      tripName: '',
      username: '',
      fb_id: '',
      email: '',
      tripDesc: '',
      receiptName: '',
      items: [],
      selectItem: '',
      selectMember: '',
      members: [],
      member: '',
      memberExist: false,
      name: '',
      sideMenuState: false,
      amount: '',
      sumBill: '',
      sumTax: '',
      sumTip: 0,
      sumTotal: 0,
      memberSum: {},
      amount: '',
      sideMenuState: false,
      windowHeight: '',
      recent: [ {name: 'No trips yet. Now create one!'}],
      friendEmail: '',
      addFriendStatus: '',
      friendsList: []
    };

    this.verifyAuthentication = this.verifyAuthentication.bind(this);
    this.handleClickLogout = this.handleClickLogout.bind(this);
    this.addItem = this.addItem.bind(this);
    this.handleTripNameSubmit = this.handleTripNameSubmit.bind(this);
    this.callGVision = this.callGVision.bind(this);
    this.onGVision = this.onGVision.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.addMember = this.addMember.bind(this);
    this.memberExist = this.memberExist.bind(this);
    this.itemOnClick = this.itemOnClick.bind(this);
    this.memberOnClick = this.memberOnClick.bind(this);
    this.initialMemberSelect = this.initialMemberSelect.bind(this);
    this.menuOnClick = this.menuOnClick.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.calculateMemberSum = this.calculateMemberSum.bind(this);
    this.calculateTotal = this.calculateTotal.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.getRecentTrip = this.getRecentTrip.bind(this);
    this.handleAddFriendChange = this.handleAddFriendChange.bind(this);
    this.handleAddFriend = this.handleAddFriend.bind(this);
    this.handleRemoveFriend = this.handleRemoveFriend.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleSetSummary = this.handleSetSummary.bind(this);
    this.updateTripSummary = this.updateTripSummary.bind(this);
  }

  handleSetSummary(summary) {
    this.setState(summary);
  }

  handleRemoveFriend(email) {
    var self = this;
    $.ajax({
      url: '/removefriend',
      type: 'POST',
      data: {
        email: this.state.email,
        friendEmail: email
      },
      success: function(result) {
        self.setState({friendsList: result, addFriendStatus: ''});
      },
      error: function(err) {
        console.log(err.responseText);
      }
    });
  }

  handleAddFriend() {
    var self = this;
    $.ajax({
      url: '/addfriend',
      type: 'POST',
      data: {
        email: this.state.email,
        friendEmail: this.state.friendEmail
      },
      success: function(result) {
        self.setState({addFriendStatus: result[0], friendsList: result[1]});
      },
      error: function(err) {
        self.setState({addFriendStatus: err.responseText});
      }
    });
  }

  handleAddFriendChange(e) {
    this.setState({friendEmail: e.target.value});
  }

  verifyAuthentication(userInfo) {
    console.log('USER INFO', userInfo);
    this.setState({
      isAuthenticated: userInfo.isAuthenitcated,
      username: userInfo.name || '',
      members: userInfo.name !== undefined ? this.state.members.concat([[userInfo.name]]) : this.state.members,
      fb_id: userInfo.fb_id || '',
      email: userInfo.email || '',
      friendsList: userInfo.friendsList || []
    });
  }

  handleClickLogout(event) {
    event.preventDefault();
    Util.logout(this.verifyAuthentication);
  }

  addItem (itemArray) {
    if (this.state.name === '' || this.state.amount === '') {
      console.log('Please include item and price');
    } else {
      this.setState({
        items: this.state.items.concat([[{
          name: this.state.name,
          amount: this.state.amount,
          members: []
        }]])
      });
    }
    this.state.name = '';
    this.state.amount = '';
  }

  deleteItem(index) {
    delete this.state.items[index];
    this.setState({
      items: this.state.items
    });
  }

  callGVision(form) {
    let data = new FormData(form);
    let currentScope = this;
    $.ajax({
      type: 'POST',
      url: '/upload',
      data: data,
      processData: false,
      contentType: false,
      success: (results) => {
        this.onGVision(results);
      },
    });
  }

  onGVision(itemizationObject) {
    let itemArray = [];
    for (var key in itemizationObject) {
      if (key.search(/tax/ig) !== -1) {
        if (!isNaN) {
          this.setState({sumTax: Number(itemizationObject[key])});
        }
      }
      if (key.search(/(\btotal|\btota)/i) !== -1) {
        this.setState({sumTotal: Number(itemizationObject[key])});
      }
      if (key.search(/(\btotal|\btota)/i) === -1 && key.search(/tax/ig) === -1) {
        itemArray.push([{
          name: key,
          amount: itemizationObject[key],
          members: []
        }]);
      }


    }
    this.setState({items: itemArray});
  }

  addMember (itemArray) {
    this.memberExist(this.state.member, (exist) => {
      this.setState({
        memberExist: exist
      });
      if (!exist) {
        this.setState({
          members: this.state.members.concat([[this.state.member]])
        });
      }
    });
    this.state.member = '';
  }


  componentDidMount() {
    this.getRecentTrip();
  }

  //TECH DEBT for POST request
  //queries DB for trips. sets the state for all the trips
  getRecentTrip() {
    let user = this.state;
    $.ajax({
      type: 'POST',
      url: '/recent',
      data: user,
      success: (results) => {
        console.log('app component trips of this person', results);
        this.setState({
          // NEED MORE PROPERTIES ON RESULTS TO SET STATE
          recent: results
        });
      },
      error: (error) => {
        console.log('error', error);
      }
    });
  }


  calculateTotal() {
    let sum = 0;
    this.state.items.map((item, index) => {
      if (item[0].members.length === 0) {
        item[0].members = [].concat.apply([], this.state.members);
      }
      if (item[0].name !== '<NOTE>') {
        sum += Number(item[0].amount);
      }
    });
    this.setState({
      sumBill: sum.toFixed(2)
    });
  }

  onInputChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    });
  }

  calculateMemberSum() {
    var memberSum = {};
    var currentScope = this;
    this.state.items.forEach(function(itemArr) {
      var itemObj = itemArr[0];
      var eachPrice = itemObj.amount / itemObj.members.length;
      console.log('....??', itemObj);
      if (itemObj.members.length === 0) {
        // itemObj.members = [].concat.apply([], this.state.members);
        itemObj.members.push('Testing');
      }
      for (var i = 0; i < itemObj.members.length; i++) {
        if (memberSum[itemObj.members[i]]) {
          memberSum[itemObj.members[i]] += eachPrice;
        } else {
          memberSum[itemObj.members[i]] = eachPrice;
        }
      }
    });
    this.setState({memberSum: memberSum});
  }


  memberExist(member, cb) {
    let exist = false;
    this.state.members.forEach((val, index) => {
      if (val[0].toUpperCase().trim() === member.toUpperCase().trim()) {
        exist = true;
      }
    });
    cb(exist);
  }

  handleTripNameSubmit(event) {
    Util.sendServerTripName(this.state.tripName, this.state.tripDesc );
  }

  itemOnClick(index) {
    const member = this.state.selectMember;
    let members = this.state.items[index][0].members;
    let items = this.state.items.slice();
    let membersCurrIndex = members.indexOf(member);

    if (membersCurrIndex < 0) {
      items[index][0].members = members.concat([member]);
    } else {
      members.splice(membersCurrIndex, 1);
    }

    this.setState({
      items: items,
      selectItem: index
    });
  }

  initialMemberSelect() {
    if (this.state.selectMember.length === 0) {
      this.setState({
        selectMember: this.state.username
      });
    }
  }

  memberOnClick(member) {
    this.setState({
      selectMember: member
    });
  }

  menuOnClick() {
    this.setState({
      sideMenuState: true
    });
  }

  closeMenu() {
    this.setState({
      sideMenuState: !this.state.sideMenuState
    });
  }

  updateDimensions() {
    this.setState({
      windowHeight: window.innerHeight
    });
  }

  sendMessage(e, data, cb) {
    e.preventDefault();
    console.log('send message clicked with these parameters -->', data);
    $.ajax({
      type: 'POST',
      url: '/submit/email',
      data: data,
      success: cb
    })
  }

  updateTripSummary(tripData) {
    this.setState({
      sumBill: tripData.sumBill
    });
  }

  render() {
    return (
      <div className='site-container'>
        <Router>
          <div
            onClick={this.state.sideMenuState ? this.closeMenu : null}
            className={this.state.sideMenuState ? 'site-pusher-on' : 'site-pusher'}>
            <Navbar
              isAuthenticated={this.state.isAuthenticated}
              handleClickLogout={this.handleClickLogout}
              menuOnClick={this.menuOnClick}
              sideMenuState={this.state.sideMenuState}
              recent={this.getRecentTrip}
              updateState={this.updateTripState}

            />
          <div className='content-container'>
            <PrivateRouteHome path="/" isAuthenticated={this.state.isAuthenticated}
              data={this.state}
            />
            <PrivateRoute
              path="/create-trip"
              component={CreateTrip}
              isAuthenticated={this.state.isAuthenticated}
              tripName={this.state.tripName}
              onInputChange={this.onInputChange}
              handleTripNameSubmit={this.handleTripNameSubmit}
            />
            <PrivateRoute
              path ="/profile"
              isAuthenticated={this.state.isAuthenticated}
              component={Profile}
            />
            <PrivateRoute
              path ="/upload-receipt"
              isAuthenticated={this.state.isAuthenticated}
              component={UploadReceipt}
              tripName={this.state.tripName}
              tripDesc={this.state.tripDesc}
              data={this.state}
              callGVision={this.callGVision}
              data={this.state}
              onInputChange={this.onInputChange}
            />
            <PrivateRoute path="/additems" isAuthenticated={this.state.isAuthenticated} component={Itemization}
              addItem={this.addItem}
              itemName={this.state.name}
              itemAmount={this.state.amount}
              selectItem={this.state.selectItem}
              selectMember={this.state.selectMember}
              items={this.state.items}
              deleteItem={this.deleteItem}
              members={this.state.members}
              member={this.state.member}
              sumBill={this.state.sumBill}
              sumTax={this.state.sumTax}
              sumTaxTip={this.state.sumTaxTip}
              calculateTotal={this.calculateTotal}
              memberExist={this.state.memberExist}
              addMember={this.addMember}
              initialMemberSelect={this.initialMemberSelect}
              itemOnClick={this.itemOnClick}
              memberOnClick={this.memberOnClick}
              onInputChange={this.onInputChange}/>
            <PrivateRoute
              path ="/summary"
              isAuthenticated={this.state.isAuthenticated}
              component={MemberSummary}
              calculateMemberSum={this.calculateMemberSum}
              data={this.state}
            />
            <PrivateRoute
              path ="/receipt-summary"
              isAuthenticated={this.state.isAuthenticated}
              component={ReceiptSummary}
              calculateMemberSum={this.calculateMemberSum}
              data={this.state}
            />
            <PrivateRoute
              path ="/breakdown"
              isAuthenticated={this.state.isAuthenticated}
              component={Breakdown}
              data={this.state}
              recent={this.getRecentTrip}
              sendMessage={this.sendMessage}
            />
            <PrivateRoute
              path ="/recent-trips"
              isAuthenticated={this.state.isAuthenticated}
              component={TripSummary}
              data={this.state}
              recent={this.getRecentTrip}
              setSummary={this.handleSetSummary}
              tripName={this.state.tripName}
            />
            <PrivateRoute
              path ="/friends"
              isAuthenticated={this.state.isAuthenticated}
              component={Friends}
              data={this.state}
              recent={this.getRecentTrip}
              addFriendChange={this.handleAddFriendChange}
              addFriend={this.handleAddFriend}
              addFriendStatus={this.state.addFriendStatus}
              friendsList={this.state.friendsList}
              removeFriend={this.handleRemoveFriend}
            />
            <Route path ="/login" render={() => (
              this.state.isAuthenticated ? <Redirect to="/" /> : <Login />
            )}/>
            </div>
          </div>
        </Router>
      </div>
    );
  }

  componentWillMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
    Util.verify(this.verifyAuthentication);
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
