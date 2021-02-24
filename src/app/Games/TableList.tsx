/*!

=========================================================
* Now UI Dashboard React - v1.4.0
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";

// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Row,
  Col,
  CardText,
} from "reactstrap";

import { thead } from "common/variables/general";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GameRow from "app/Games/GameRow";
import ReactGA from "react-ga";
import { Form, Jumbotron } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Game } from "common/models/Game";
import { Book } from "common/models/Book";
import LastRefreshTimeService from "common/services/LastRefreshTimeService";
import GamesService from "common/services/GamesService";

const animatedComponents = makeAnimated();

interface TableListProps {
  sport: string;
  allBooks: Book[];
  checkedBooks: Book[];
  handleSportsbookChange: Function;
  isLoggedIn: string;
  setUserDefaults: Function;
}

interface TableListState {
  endDate: Date;
  startDate: Date;
  lastRefreshTime: Date;
  games: Game[];
}

class RegularTables extends React.Component<TableListProps, TableListState> {
  state = {
    games: [] as Game[],
    startDate: new Date(),
    endDate: new Date(),
    lastRefreshTime: new Date(),
  };

  render() {
    return (
      <>
        <div className="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary" tag="h3">
                {this.props.sport} Best Lines (PA)
              </CardTitle>
              <CardText>
                <div className="text-muted">
                  Last Refresh Time:{" "}
                  {this.getFormattedDate(this.state.lastRefreshTime)}
                </div>
                <br />
                <Row>
                  <Col lg={2}>{this.getDateSelector()}</Col>
                  <br />
                  <Col lg={{ span: 2, offset: 6 }} s={true} xs={true}>
                    <Form.Label>Select Sportsbooks</Form.Label>
                    <br></br>
                    <Select
                      isSearchable={false}
                      isMulti={true}
                      options={this.props.allBooks}
                      components={animatedComponents}
                      onChange={this.props.handleSportsbookChange}
                      placeholderButtonLabel="Sportsbooks..."
                      value={this.props.checkedBooks}
                    />
                    {this.props.isLoggedIn && (
                      <Button onClick={this.props.setUserDefaults}>
                        Save Selections
                      </Button>
                    )}
                  </Col>
                </Row>
              </CardText>
            </CardHeader>
            <CardBody>
              {this.state.games.length === 0
                ? this.props.sport === "NFL"
                  ? this.renderNoGamesWeekMessage()
                  : this.renderNoGamesTodayMessage()
                : this.props.checkedBooks == null ||
                  this.props.checkedBooks.length === 0
                ? this.renderNoBooksCheckedMessage()
                : this.renderTable()}
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  renderGameRows() {
    var sortGames = this.state.games;
    sortGames.sort(function (a, b) {
      return Math.abs(
        new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
      );
    });
    return sortGames.map((game) => {
      return (
        <GameRow
          key={game.gameId}
          sport={this.props.sport}
          homeTeamId={game.homeTeamId}
          awayTeamId={game.awayTeamId}
          gameId={game.gameId}
          checkedBooks={
            this.props.checkedBooks != null
              ? this.props.checkedBooks.map((book) => book.value)
              : []
          }
          gameTime={game.timeStamp}
        />
      );
    });
  }

  renderNoGamesWeekMessage() {
    return (
      <Jumbotron>
        <h1>Lines not available!</h1>
        <p>Please select a different week</p>
      </Jumbotron>
    );
  }

  renderNoGamesTodayMessage() {
    return (
      <Jumbotron>
        <h1>No Games Today!</h1>
        <p>Please use the calendar to select a new date</p>
      </Jumbotron>
    );
  }

  renderNoBooksCheckedMessage() {
    return (
      <Jumbotron>
        <h1>No books!</h1>
        <p>
          Please select at least one sportsbook in order to see the best
          available game lines.
        </p>
      </Jumbotron>
    );
  }

  renderTable() {
    return (
      <Table responsive>
        <thead className="text-primary">
          <tr>
            {thead.map((prop, key) => {
              if (key === thead.length - 1)
                return (
                  <th key={key} className="text-left">
                    {prop}
                  </th>
                );
              return <th key={key}>{prop}</th>;
            })}
          </tr>
        </thead>
        <tbody className="games-striped">{this.renderGameRows()}</tbody>
      </Table>
    );
  }

  getFormattedDate(dateString) {
    let options = {
      hour: "numeric",
      minute: "2-digit",
    };

    return new Date(dateString + "Z").toLocaleTimeString("en-us", options);
  }

  getDateSelector() {
    if (this.props.sport === "NFL") {
      return (
        <Form>
          <Form.Label>Select Week</Form.Label>
          <Form.Control
            as="select"
            defaultValue={this.getDefaultDateSelect()}
            onChange={this.handleWeekChange.bind(this)}
          >
            <option value="12/31/2020-01/05/2021">Week 17</option>
            <option value="1/07/2021-01/11/2021">Wildcard Weekend</option>
            <option value="01/15/2021-01/18/2021">Divisional Round</option>
            <option value="01/23/2021-01/25/2021">
              Conference Championships
            </option>
            <option value="02/06/2021-02/08/2021">Super Bowl</option>
          </Form.Control>
        </Form>
      );
    } else {
      return (
        <div>
          <Form.Label>Select Date</Form.Label>
          <br></br>
          <DatePicker
            selected={this.state.startDate}
            onChange={this.handleDateChange}
          />
        </div>
      );
    }
  }

  handleDateChange = (date) => {
    if (date.getDate() > new Date().getDate()) date.setHours(0, 0, 0);
    this.setState({
      startDate: date,
    });

    ReactGA.event({
      category: "User",
      action: "Changed date",
      value: date,
    });
  };

  handleWeekChange(event) {
    var dateRange = event.target.value.split("-");
    var now = new Date();
    var startDate = new Date(dateRange[0]);
    if (now > startDate) startDate = now;
    var endDate = new Date(dateRange[1]);
    this.setState({
      startDate: startDate,
      endDate: endDate,
    });
  }

  getDefaultDateSelect() {
    var currentDate = new Date();
    var currentDay = currentDate.getDate();
    var currentMonth = currentDate.getMonth();
    var currentYear = currentDate.getFullYear();
    if (currentYear === 2020 || currentYear === 2021) {
      if (currentMonth === 8) {
        if (currentDay >= 10 && currentDay <= 14) {
          return "9/10/2020-9/15/2020";
        } else if (currentDay >= 15 && currentDay <= 21) {
          return "9/17/2020-9/22/2020";
        } else if (currentDay >= 22 && currentDay <= 28) {
          return "9/24/2020-9/29/2020";
        } else if (currentDay >= 29) {
          return "10/01/2020-10/06/2020";
        }
      } else if (currentMonth === 9) {
        if (currentDay >= 1 && currentDay <= 5) {
          return "10/01/2020-10/06/2020";
        } else if (currentDay >= 6 && currentDay <= 12) {
          return "10/08/2020-10/13/2020";
        } else if (currentDay >= 13 && currentDay <= 19) {
          return "10/15/2020-10/20/2020";
        } else if (currentDay >= 20 && currentDay <= 26) {
          return "10/22/2020-10/27/2020";
        } else if (currentDay >= 27) {
          return "10/29/2020-11/03/2020";
        }
      } else if (currentMonth === 10) {
        if (currentDay <= 2) {
          return "10/29/2020-11/03/2020";
        } else if (currentDay >= 3 && currentDay <= 9) {
          return "11/05/2020-11/10/2020";
        } else if (currentDay >= 10 && currentDay <= 16) {
          return "11/12/2020-11/17/2020";
        } else if (currentDay >= 17 && currentDay <= 23) {
          return "11/19/2020-11/24/2020";
        } else if (currentDay >= 24 && currentDay <= 30) {
          return "11/26/2020-12/01/2020";
        } else if (currentDay >= 31) {
          return "12/03/2020-12/08/2020";
        }
      } else if (currentMonth === 11) {
        if (currentDay >= 1 && currentDay <= 7) {
          return "12/03/2020-12/08/2020";
        } else if (currentDay >= 8 && currentDay <= 14) {
          return "12/10/2020-12/15/2020";
        } else if (currentDay >= 15 && currentDay <= 21) {
          return "12/17/2020-12/22/2020";
        } else if (currentDay >= 22 && currentDay <= 28) {
          return "12/24/2020-12/29/2020";
        } else if (currentDay >= 29) {
          return "12/31/2020-01/05/2020";
        }
      } else if (currentMonth === 0) {
        if (currentDay <= 4) {
          return "12/31/2020-01/05/2021";
        }
        if (currentDay <= 10) {
          return "1/07/2021-01/11/2021";
        }
        if (currentDay <= 17) {
          return "01/15/2021-01/18/2021";
        }
        if (currentDay <= 24) {
          return "01/23/2021-01/25/2021";
        }
        return "02/06/2021-02/08/2021";
      } else if (currentMonth === 1) {
        return "02/06/2021-02/08/2021";
      }
    }
    return "9/10/2020-9/15/2020";
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.startDate === this.state.startDate &&
      prevState.endDate === this.state.endDate &&
      prevProps.sport === this.props.sport
    )
      return;

    if (prevProps.sport !== this.props.sport) {
      if (this.props.sport !== "NFL") this.setState({ startDate: new Date() });
      else {
        var dateRange = this.getDefaultDateSelect().split("-");
        var startDate = new Date();
        var endDate = new Date(dateRange[1]);
        this.setState({ startDate: startDate, endDate: endDate });
      }
    }

    if (prevState.startDate !== this.state.startDate) {
      if (this.state.startDate.getDate() < new Date().getDate())
        // Don't show games in the past
        this.setState({ games: [] });
      else if (this.props.sport !== "NFL")
        this.fetchGamesOnDay(this.state.startDate);
      else {
        this.fetchGamesInRange(this.state.startDate, this.state.endDate);
      }
    }
  }

  async componentWillMount() {
    if (this.props.sport === "NFL") {
      var dateRange = this.getDefaultDateSelect().split("-");
      var startDate = new Date();
      var endDate = new Date(dateRange[1]);
      this.fetchGamesInRange(startDate, endDate);
    } else {
      this.fetchGamesOnDay(new Date());
    }
    let refreshTime = await LastRefreshTimeService.getRefreshTime("GameLines");
    this.setState({ lastRefreshTime: refreshTime });
  }

  async fetchGamesInRange(startDate: Date, endDate: Date) {
    endDate.setHours(23, 59, 59, 999);
    const games = await GamesService.getGamesByDateRange(
      startDate,
      endDate,
      this.props.sport
    );
    this.setState({ games: games });
  }

  fetchGamesOnDay(date) {
    var endTime = new Date(date);
    this.fetchGamesInRange(date, endTime);
  }
}

export default RegularTables;