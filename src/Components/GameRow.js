import React from 'react';
import { apiUrl } from './Constants';

class GameRow extends React.Component {
    state = {
        homeTeamName : null,
        awayTeamName : null,
        currentAwaySpread : 0,
        currentAwaySpreadPayout: 0,
        currentAwaySpreadSite : null,
        currentHomeSpread : 0,
        currentHomeSpreadPayout : 0,
        currentHomeSpreadSite : null,
        currentOver : 0,
        currentOverPayout : 0,
        currentOverSite : null,
        currentUnder : 0,
        currentUnderPayout : 0,
        currentUnderSite : null,
        currentHomeMoneyline : 0,
        currentHomeMoneylineSite : null,
        currentAwayMoneyline : 0,
        currentAwayMoneylineSite : null
    }

    render()
    {
        return (
            <React.Fragment>
                <tr style={{borderLeft: '2px solid black', borderRight: '2px solid black', borderTop: '2px solid black'}}>
                    <th scope="row">{this.state.awayTeamName}</th>
                    {this.getDisplayCell(this.state.currentAwaySpread, this.state.currentAwaySpreadPayout, this.state.currentAwaySpreadSite, null)}
                    {this.getDisplayCell(this.state.currentAwayMoneyline, null, this.state.currentAwayMoneylineSite, null)}
                    {this.getDisplayCell(this.state.currentOver, this.state.currentOverPayout, this.state.currentOverSite, "o")}
                </tr>
                <tr style={{borderLeft: '2px solid black', borderRight: '2px solid black', borderBottom: '2px solid black'}}>
                    <th scope="row">{this.state.homeTeamName}</th>
                    {this.getDisplayCell(this.state.currentHomeSpread, this.state.currentHomeSpreadPayout, this.state.currentHomeSpreadSite, null)}
                    {this.getDisplayCell(this.state.currentHomeMoneyline, null, this.state.currentHomeMoneylineSite, null)}
                    {this.getDisplayCell(this.state.currentUnder, this.state.currentUnderPayout, this.state.currentUnderSite, "u")}
                </tr>
            </React.Fragment>
            )
    };

    getDisplayCell(val, odds, site, appendedLetters){
        if(val == null)
            return (<td><b>_</b></td>);
        if(odds == null) //Moneyline
            return (<td><b>{this.getDisplayValue(val)}</b><br/>{site}</td>)
        
        return (
             <td>
                 {appendedLetters}
                 <b>
                    {appendedLetters == null ? this.getDisplayValue(val) : val}
                </b>
                <sup>
                    {this.getOddsDisplayValue(odds)}
                </sup>
                <br/>{site}
            </td>);
        
    }
    getDisplayValue(val) {
        if(val > 0)
            return "+" + val
        return val;
    }

    getOddsDisplayValue(val) {
        return "(" + this.getDisplayValue(val) + ")";
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.checkedBooks != this.props.checkedBooks)
        {
            fetch(apiUrl + '/GameLines/best/' + this.props.gameId + "?sportsbooks=" + this.props.checkedBooks.join())
            .then(res => res.json()) 
            .then(data => this.setState({ 
                currentAwaySpread: data.currentAwaySpread,
                currentAwaySpreadPayout: data.currentAwaySpreadPayout,
                currentAwaySpreadSite: data.awaySpreadSite,
                currentHomeSpread: data.currentHomeSpread,
                currentHomeSpreadPayout: data.currentHomeSpreadPayout,
                currentHomeSpreadSite: data.homeSpreadSite,
                currentAwayMoneyline: data.currentAwayMoneyLine,
                currentAwayMoneylineSite: data.awayMoneyLineSite,
                currentHomeMoneyline: data.currentHomeMoneyLine,
                currentHomeMoneylineSite: data.homeMoneyLineSite,
                currentOver: data.currentOver,
                currentOverPayout : data.currentOverPayout,
                currentOverSite: data.overSite,
                currentUnder: data.currentUnder,
                currentUnderPayout : data.currentUnderPayout,
                currentUnderSite: data.underSite,
            }))
            .catch()
        }
    }
    componentDidMount() {
        fetch(apiUrl + '/teams/' + this.props.homeTeamId)
        .then(res => res.json()) 
        .then(data => this.setState({ 
            homeTeamName: data.location + ' ' + data.mascot
         }))

         fetch(apiUrl + '/teams/' + this.props.awayTeamId)
        .then(res => res.json()) 
        .then(data => this.setState({ 
            awayTeamName: data.location + ' ' + data.mascot
         }))

         fetch(apiUrl + '/GameLines/best/' + this.props.gameId + "?sportsbooks=" + this.props.checkedBooks.join())
        .then(res => res.json()) 
        .then(data => this.setState({ 
            currentAwaySpread: data.currentAwaySpread,
            currentAwaySpreadPayout: data.currentAwaySpreadPayout,
            currentAwaySpreadSite: data.awaySpreadSite,
            currentHomeSpread: data.currentHomeSpread,
            currentHomeSpreadPayout: data.currentHomeSpreadPayout,
            currentHomeSpreadSite: data.homeSpreadSite,
            currentAwayMoneyline: data.currentAwayMoneyLine,
            currentAwayMoneylineSite: data.awayMoneyLineSite,
            currentHomeMoneyline: data.currentHomeMoneyLine,
            currentHomeMoneylineSite: data.homeMoneyLineSite,
            currentOver: data.currentOver,
            currentOverPayout : data.currentOverPayout,
            currentOverSite: data.overSite,
            currentUnder: data.currentUnder,
            currentUnderPayout : data.currentUnderPayout,
            currentUnderSite: data.underSite,
         }))
        }
}

export default GameRow;