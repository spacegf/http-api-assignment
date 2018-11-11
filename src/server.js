const http = require('http');
const url = require('url');
const fs = require('fs');
const xml = require('xml');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const checkParams = (request, param, val) => {
	const { query } = url.parse(request.url, true).query;
	if(param in query && query[param] === val){
		return true;
	} 
	return false;
};

const setResponse = (status, id, message, request, response) => {
	const resType = request.headers['accept'];
	const resMessage = {
		id: id,
		message: message
	};

	response.writeHead(status, {'Content-Type': resType});

	if(resType === 'application/json'){
		response.write(JSON.stringify(resMessage));
	} else if (resType === 'text/xml'){
		response.write(xml({response: [{id: resMessage.id}, {message: resMessage.message}]}));
	}

	response.end();
};

const getContent = (request, response) => {
  const reqUrl = url.parse(request.url).pathname;
  switch (reqUrl) {
	case '/success':
		setResponse(200, 'success', 'successful response', request, response);
		break;
	case '/badRequest':
		if(checkParams(request, 'valid', 'true')){
			setResponse(200, 'badRequest', 'has parameter', request, response);
		} else {
			setResponse(400, 'badRequest', 'missing parameter', request, response);
		}
		break;
	case '/unauthorized':
		if(checkParams(request, 'loggedIn', 'yes')){
			setResponse(200, 'unauthorized', 'logged in', request, response);
		} else {
			setResponse(401, 'unauthorized', 'not logged in', request, response);
		}
		break;
	case '/forbidden':
		setResponse(403, 'forbidden', 'you are forbidden', request, response);
		break;
	case '/internal':
		setResponse(500, 'internal', 'server error', request, response);
		break;
	case '/notImplemented':
		setResponse(501, 'notImplemented', 'feature not implemented', request, response);
		break;
	case '/notFound':
		setResponse(404, 'notFound', 'page not found', request, response);
		break;
	default:
		if (fs.existsSync(`${__dirname}/../client/${reqUrl}`)) {
			const page = fs.readFileSync(`${__dirname}/../client/${reqUrl}`);
			if(reqUrl.indexOf('css') > -1){
				response.writeHead(200, {'Content-Type': `text/css`});
			}
			response.write(page);
			response.end();
		} else {
			response.write('dne');
			response.end();
		}
		break;
  }
};

http.createServer(getContent).listen(port);


