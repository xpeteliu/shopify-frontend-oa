import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Card, Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=${process.env.REACT_APP_API_KEY}&sol=1000`;

function App() {

    const [pics, setPics] = useState([])
    const [likes, setLikes] = useState({})

    useEffect(() => {
        // get likes from localStorage if there is any
        const localLikesString = localStorage.getItem("likes");
        if (localLikesString != null) {
            setLikes(JSON.parse(localLikesString));
        }

        // initialize pictures
        const init = async () => {
            const resp = await ((await fetch(
                `${url}&page=1`))
                .json());
            setPics(resp['photos'])
        }
        init();
    }, [])

    const update = async () => {
        const resp = await ((await fetch(
            `${url}&page=${Math.ceil(pics.length / 25.0) + 1}`))
            .json());
        setPics([...pics, ...resp['photos']])
    }

    const like = (src) => {
        const copy = {...likes};
        copy[src] = true;
        setLikes(copy);
        localStorage.setItem("likes", JSON.stringify(copy));
    }

    const unlike = (src) => {
        const copy = {...likes};
        copy[src] = false;
        setLikes(copy);
        localStorage.setItem("likes", JSON.stringify(copy));
    }

    return (
        <div className="App">
            <h1 className="mt-4">Spacestagram</h1>
            <InfiniteScroll
                dataLength={pics.length}
                next={update}
                hasMore={true}
                loader={<h4>Loading...</h4>}
            >
                {pics.map(elem => (
                    <Card className="mx-auto mt-4" bg={"light"} style={{width: '30rem'}}
                          key={elem["img_src"]}>
                        <Card.Img variant="top"
                                  src={elem["img_src"]}/>
                        <Card.Body className="container">
                            <Row>
                                <Col className="text-start">
                                    <Card.Title>{`${elem["rover"]["name"]} rover - ${elem["camera"]["full_name"]}`}</Card.Title>
                                    <Card.Text>{`${elem["earth_date"]}`}</Card.Text>
                                    {likes[elem["img_src"]] === true ?
                                        <Button className="mt-4" variant="secondary" onClick={() => {
                                            unlike(elem["img_src"])
                                        }}>Unlike</Button>
                                        :
                                        <Button className="mt-4" variant="primary" onClick={() => {
                                            like(elem["img_src"])
                                        }}>Like</Button>
                                    }
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </InfiniteScroll>
        </div>
    );
}

export default App;
