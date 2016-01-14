var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var app = express(); 

var CONFIG = require('./config.json');
var PORT = parseInt(CONFIG.server.port, 10);
var HOST_NAME = CONFIG.server.hostName;
var DATABASE_NAME = CONFIG.database.name;
var TOKEN_SECRET = CONFIG.token.secret;
var TOKEN_EXPIRES = parseInt(CONFIG.token.expiresInSeconds, 10);
var User = require('./models/user.js');
var Archaeologist = require('./models/archaeologist.js');
var Company = require('./models/company.js');
var Excavation = require('./models/excavation.js');
var Thumbnail = require('./models/thumbnail.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

mongoose.connect('mongodb://' + HOST_NAME + '/' + DATABASE_NAME);

var apiRouter = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRouter.post('/users/authenticate', function authenticateUser(request, response) {

  // find the user
  User.findOne({
    email: request.body.email
  }, function handleQuery(error, user) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (! user) {

      response.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
      });

      return;
    }

    bcrypt.compare(request.body.password, user.password, function (error, result) {

      if (error) {
        response.status(500).json({
          success: false,
          message: 'Internal server error'
        });

        throw error;
      }

      if (! result) {

        response.status(401).json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });

        return;
      }

      // if user is found and password is right
      // create a token
      var token = jsonwebtoken.sign({ email: user.email }, TOKEN_SECRET, {
        expiresIn: TOKEN_EXPIRES
      });

      // return the information including token as JSON
      response.json({
        success: true,
        token: token
      });

    });
  });
});

apiRouter.post('/users/', function createUser(request, response) {

  // find the user
  User.findOne({
    email: request.body.email
  }, function handleQuery(error, user) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (user) {
      response.status(409).json({
        success: false,
        message: 'User with the email \'' + request.body.email + '\' already exists.'
      });

      return;
    }

    bcrypt.genSalt(10, function (error, salt) {

      if (error) {
        response.status(500).json({
          success: false,
          message: 'Internal server error'
        });

        throw error;
      }

      bcrypt.hash(request.body.password, salt, function (error, hash) {

        if (error) {
          response.status(500).json({
            success: false,
            message: 'Internal server error'
          });

          throw error;
        }

        var user = new User({
          email: request.body.email,
          password: hash
        });

        user.save(function (error) {

          if (error) {
            response.status(500).json({
              success: false,
              message: 'Internal server error'
            });

            throw error;
          }

          response.json({
            success: true
          });
        });
      });
    });
  });
});

apiRouter.post('/archaeologists/', function createArchaeologistProfileDetails(request, response) {

  var archaeologist = new Archaeologist({
    id: request.body.id,
    first_name: request.body.first_name,
    last_name: request.body.last_name,
    date_of_birth: request.body.date_of_birth,
    address1: request.body.address1,
    address2: request.body.address2,
    address3: request.body.address3,
    city: request.body.city,
    postcode: request.body.postcode,
    home_phone_number: request.body.home_phone_number,
    mobile_phone_number: request.body.mobile_phone_number,
    experience: request.body.experience,
    specialism: request.body.specialism,
    cscs_card: request.body.cscs_card,
    description: request.body.description
  });

  archaeologist.save(function (error) {

    if (error) {
            response.status(500).json({
              success: false,
              message: 'Internal server error'
            });

            throw error;
        }

        response.json({
            success: true
        });
  });
});

apiRouter.post('/companies/', function createCompanyProfileDetails(request, response) {

  var company = new Company({
    name: request.body.name,
    address1: request.body.address1,
    address2: request.body.address2,
    address3: request.body.address3,
    city: request.body.city,
    postcode: request.body.postcode,
    phone_number: request.body.phone_number,
    url: request.body.url,
    description: request.body.description
  });

  company.save(function (error) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    response.json({
      success: true
    });
  });
});

// route middleware to verify a token
apiRouter.use(function verifyToken(request, response, next) {

  // check header or url parameters or post parameters for token
  var token = request.body.token || request.query.token || request.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jsonwebtoken.verify(token, TOKEN_SECRET, function (error, decoded) {

      if (error) {

        response.status(403).json({
          success: false,
          message: 'Failed to authenticate token.'
        });

        return;
      }

      // if everything is good, save to request for use in other routes
      request.decoded = decoded;

      next();
    });

  } else {

    // if there is no token
    // return an error
    response.status(403).json({
      success: false,
      message: 'No token provided.'
    });
  }
});

apiRouter.get('/archaeologists/:id', function getArchaeologistProfile(request, response) {

  var id = request.params.id;
  console.log(id);
  console.log('yay');

  Archaeologist.findOne({id: id}, function handleDBQueryResults(error, archaeologists) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    response.status(200).json(archaeologists);
  });
});

apiRouter.patch('/archaeologists/:id', function updateArchaeologistProfile(request, response) {

  var id = request.params.id;
  var body = request.body;
  console.log('PATCH archaeologists ' + id);
  console.log(body);

  Archaeologist.findOne({id: id}, function handleDBQueryResults(error, archaeologist) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (archaeologist) {
      if (body.address1) {
        archaeologist.address1 = body.address1;
      }
      if (body.address2) {
        archaeologist.address2 = body.address2;
      } 
      if (body.address3) {
        archaeologist.address3 = body.address3;
      }
      if (body.city) {
        archaeologist.city = body.city;
      }
      if (body.postcode) {
        archaeologist.postcode = body.postcode;
      }
      if (body.home_phone_number) {
        archaeologist.home_phone_number = body.home_phone_number;
      }
      if (body.mobile_phone_number) {
        archaeologist.mobile_phone_number = body.mobile_phone_number;
      }
      if (body.specialism) {
        archaeologist.specialism = body.specialism;
      }
      if (body.experience) {
        archaeologist.experience = body.experience;
      }
      if (body.description) {
        archaeologist.description = body.description;
      }

      archaeologist.save();

      response.json(archaeologist);

      return;
    }

    response.status(404).json({});
  });
});

apiRouter.delete('/archaeologists/:id', function deleteArchaeologistProfile(request, response) {

  var id = request.params.id;
  console.log('DELETE archaeologists ' + id);

  Archaeologist.findOne({id: id}, function handleDBQueryResults(error, archaeologist) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (archaeologist) {
      archaeologist.remove(function (error) {
        if (error) {
          response.status(500).send(error);
          return;
        }

        response.status(204);
      });
      return;
    }
    response.status(404).json({});
  });
});

apiRouter.get('/companies?token=', function getCompanyProfile(request, response) {

  Archaeologist.find(function handleDBQueryResults(error, companies) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    response.status(200).json(companies);
  });
});

app.use('/api', apiRouter);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
