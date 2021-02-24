import React from "react";

// reactstrap components
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  CardText,
  FormGroup,
  Input,
} from "reactstrap";

import "react-datepicker/dist/react-datepicker.css";
import { Form, Jumbotron } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import GamePropSimpleTable from "app/GameProps/SimpleProps/GamePropSimpleTable";
import GamePropTableWithOptions from "app/GameProps/OverUnderProps/GamePropTableWithOptions";
import { GameProp } from "common/models/GameProp";
import { Book } from "common/models/Book";
import TeamService from "common/services/TeamService";
import GamePropsService from "common/services/GamePropsService";
import GamesService from "common/services/GamesService";

const animatedComponents = makeAnimated();

interface GameSpecificPropsProps {
  allBooks: Book[];
  handleSportsbookChange: Function;
  checkedBooks: Book[];
  match: any;
}

interface GameSpecificPropsState {
  HomeTeamName: string;
  HomeTeamId: string;
  AwayTeamName: string;
  AwayTeamId: string;
  GameProps: GameProp[];
  PropTypes: String[];
  searchTerm: string;
}

class GameSpecificProps extends React.Component<
  GameSpecificPropsProps,
  GameSpecificPropsState
> {
  state = {
    HomeTeamName: "",
    HomeTeamId: "",
    AwayTeamName: "",
    AwayTeamId: "",
    GameProps: [] as GameProp[],
    PropTypes: [],
    searchTerm: "",
  };
  render() {
    return (
      <>
        <div className="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary" tag="h3">
                {this.state.AwayTeamName} @ {this.state.HomeTeamName}
              </CardTitle>
              Player Props
              <br />
              <br />
              <CardText>
                <Row>
                  <Col lg={true} s={true} xs={true}>
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
                  </Col>
                </Row>
              </CardText>
              <FormGroup>
                <Input
                  onChange={this.handleSearch.bind(this)}
                  type="search"
                  placeholder="Player Search"
                ></Input>
              </FormGroup>
            </CardHeader>
            <CardBody>
              {this.state.PropTypes == null || this.state.PropTypes.length === 0
                ? this.renderErrorMessage()
                : this.state.PropTypes.map((propType) =>
                    this.renderTable(propType)
                  )}
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  async componentWillMount() {
    const game = await GamesService.getGameById(this.props.match.params.gameId);
    this.setState({
      HomeTeamId: game.homeTeamId,
      AwayTeamId: game.awayTeamId,
    });
  }

  async getGameLines() {
    const props = await GamePropsService.getProps(
      this.props.match.params.gameId,
      this.props.checkedBooks
    );
    this.setState({
      GameProps: props,
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.checkedBooks !== this.props.checkedBooks) {
      if (this.props.checkedBooks == null)
        this.setState({ GameProps: [], PropTypes: [] });
      else this.getGameLines();
    }

    if (prevState.HomeTeamId === "" && this.state.HomeTeamId !== "") {
      const homeTeam = await TeamService.getTeam(this.state.HomeTeamId);
      this.setState({
        HomeTeamName: homeTeam.location + " " + homeTeam.mascot,
      });
      const awayTeam = await TeamService.getTeam(this.state.AwayTeamId);
      this.setState({
        AwayTeamName: awayTeam.location + " " + awayTeam.mascot,
      });
    }

    if (prevState.GameProps !== this.state.GameProps) {
      let propTypes: any = [];
      if (this.state.GameProps.length > 0) {
        for (let gameProp of this.state.GameProps) {
          let tableTitle = this.getPropTableTitle(gameProp);
          if (!propTypes.includes(tableTitle)) {
            propTypes.push(tableTitle);
          }
        }
      }
      this.setState({ PropTypes: propTypes });
    }
  }

  getPropTableTitle(prop) {
    return prop.propValue === null
      ? prop.propDescription + " " + prop.propTypeDescription
      : prop.propTypeDescription;
  }

  renderErrorMessage() {
    if (!this.props.checkedBooks || this.props.checkedBooks.length === 0)
      return (
        <Jumbotron>
          <h1>No books!</h1>
          <p>
            Please select at least one sportsbook in order to see the available
            odds.
          </p>
        </Jumbotron>
      );
    else
      return (
        <Jumbotron>
          <h1>No Props!</h1>
          <p>There are no props available for this game at this time.</p>
        </Jumbotron>
      );
  }
  renderTable(propType) {
    if (!this.state.GameProps) return;

    let propsForPropType: any = this.state.GameProps.filter(
      (singleProp) => this.getPropTableTitle(singleProp) === propType
    );
    if (propsForPropType.length === 0) return;

    const first = propsForPropType[0];
    if (first.propValue !== null) {
      return (
        <GamePropTableWithOptions
          propsForPropType={propsForPropType}
          propType={propType}
          searchTerm={this.state.searchTerm}
        ></GamePropTableWithOptions>
      );
    } else {
      return (
        <GamePropSimpleTable
          propsForPropType={propsForPropType}
          propType={propType}
          searchTerm={this.state.searchTerm}
        ></GamePropSimpleTable>
      );
    }
  }

  handleSearch(event) {
    this.setState({ searchTerm: event.target.value.toLowerCase() });
  }
}
export default GameSpecificProps;