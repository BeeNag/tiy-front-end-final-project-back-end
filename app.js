var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var multer = require('multer');
var path = require('path');
var cors = require('cors');
var crypto = require('crypto');
var app = express();

var CONFIG = require('./config.json');
var PORT = parseInt(CONFIG.server.port, 10);
var HOST_NAME = CONFIG.server.hostName;
var DATABASE_NAME = CONFIG.database.name;
var TOKEN_SECRET = CONFIG.token.secret;
var TOKEN_EXPIRES = parseInt(CONFIG.token.expiresInSeconds, 10);
var FILE_SIZE_LIMIT_IN_MB = 5;
var UPLOAD_PATH = '/images/uploads/';
var Archaeologist = require('./models/archaeologist.js');
var Company = require('./models/company.js');
var Thumbnail = require('./models/thumbnail.js');

var storage = multer.diskStorage({
  destination: __dirname + UPLOAD_PATH,
  filename: function (request, file, callback) {
    crypto.pseudoRandomBytes(16, function (error, raw) {
      if (error) {
        return callback(error, null);
      }

      callback(null, raw.toString('hex') + path.extname(file.originalname));
    })
  },
  limits: {
    fileSize: FILE_SIZE_LIMIT_IN_MB * 1000000,
    files: 1
  }
});

var upload = multer({ storage: storage });

app.use(express.static(__dirname + '/images'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cors());

mongoose.connect('mongodb://' + HOST_NAME + '/' + DATABASE_NAME);

var apiRouter = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRouter.post('/archaeologists/authenticate', function authenticateArchaeologist(request, response) {

  // find the user
  Archaeologist.findOne({
    email: request.body.email
  }, function handleQuery(error, archaeologist) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (! archaeologist) {

      response.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
      });

      return;
    }

    bcrypt.compare(request.body.password, archaeologist.password, function (error, result) {

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
      var token = jsonwebtoken.sign({ email: archaeologist.email }, TOKEN_SECRET, {
        expiresIn: TOKEN_EXPIRES
      });

      var id = archaeologist.id;

      // return the information including token as JSON
      response.json({
        success: true,
        token: token,
        id: id
      });

    });
  });
});

apiRouter.post('/companies/authenticate', function authenticateCompany(request, response) {

  // find the user
  Company.findOne({
    email: request.body.email
  }, function handleQuery(error, company) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (! company) {

      response.status(401).json({
        success: false,
        message: 'Authentication failed. User not found.'
      });

      return;
    }

    bcrypt.compare(request.body.password, company.password, function (error, result) {

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
      var token = jsonwebtoken.sign({ email: company.email }, TOKEN_SECRET, {
        expiresIn: TOKEN_EXPIRES
      });

      var id = company.id;

      // return the information including token as JSON
      response.json({
        success: true,
        token: token,
        id: id
      });

    });
  });
});

// apiRouter.post('/images/upload', upload.single('image'), function handleRequest(request, response) {

//   response.json({
//     success: true,
//     file: request.file,
//     id: request.body.userId
//   });
// });

apiRouter.post('/archaeologists/', function createArchaeologist(request, response) {

  // find the user
  Archaeologist.findOne({
    email: request.body.email
  }, function handleQuery(error, archaeologist) {

    if (error) {
        response.status(500).json({
        success: false,
        message: 'Internal server error'
    });

      throw error;
    }

    if (archaeologist) {
        response.status(409).json({
        success: false,
        message: 'Archaeologist with the email \'' + request.body.email + '\' already exists.'
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
          description: request.body.description,
          email: request.body.email,
          password: hash
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
    });
  });
});

apiRouter.post('/companies/', function createCompany(request, response) {

  // find the user
  Company.findOne({
    email: request.body.email
  }, function handleQuery(error, company) {

    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (company) {
        response.status(409).json({
        success: false,
        message: 'Company with the email \'' + request.body.email + '\' already exists.'
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

        var company = new Company({
          id: request.body.id,
          name: request.body.name,
          address1: request.body.address1,
          address2: request.body.address2,
          address3: request.body.address3,
          city: request.body.city,
          postcode: request.body.postcode,
          phone_number: request.body.phone_number,
          url: request.body.url,
          description: request.body.description,
          email: request.body.email,
          password: hash
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

apiRouter.post('/images/upload', function validate(request, response, next) {

  var userId = request.body.userId;

  Archaeologist.findOne({id: userId}, function handleDBQueryResults(error, archaeologist) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    next();
  });  

}, upload.single('image'), function addImageToArchaeologistProfile(request, response, next) {

  var userId = request.body.userId;

  Archaeologist.findOne({id: userId}, function updateArchaeologistProfileWithImage(error, archaeologist) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (archaeologist) {
      archaeologist.image = request.file.filename;
    }

    archaeologist.save(function (error) {

      if (error) {
        response.status(500).json({
          success: false,
          message: 'Internal server error'
        });

        throw error;
      }

      next();
    });

  });

  

}, function handleRequest(request, response) {
  
  response.json({
    success: true,
    message: 'All good'
  });
});

apiRouter.get('/archaeologists/:id', function getArchaeologistProfile(request, response) {

  var id = request.params.id;
  console.log(id);
  console.log('yay');

  Archaeologist.findOne({id: id}, function handleDBQueryResults(error, archaeologist) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    response.status(200).json(archaeologist);
  });
});

apiRouter.patch('/archaeologists/:id', function updateArchaeologistProfile(request, response) {

  var id = request.params.id;
  var body = request.body;
  console.log('PATCH archaeologist ' + id);
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
  console.log('DELETE archaeologist ' + id);

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

        response.status(204).send({
          success: true
        });
      });
      return;
    }
    response.status(404).json({});
  });
});

apiRouter.get('/companies/:id', function getCompanyProfile(request, response) {

  var id = request.params.id;
  console.log(id);
  console.log('yay');

  Company.findOne({id: id}, function handleDBQueryResults(error, company) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    response.status(200).json(company);
  });
});

apiRouter.patch('/companies/:id', function updateCompanyProfile(request, response) {

  var id = request.params.id;
  var body = request.body;
  console.log('PATCH company ' + id);
  console.log(body);

  Company.findOne({id: id}, function handleDBQueryResults(error, company) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (company) {
      if (body.address1) {
        company.address1 = body.address1;
      }
      if (body.address2) {
        company.address2 = body.address2;
      } 
      if (body.address3) {
        company.address3 = body.address3;
      }
      if (body.city) {
        company.city = body.city;
      }
      if (body.postcode) {
        company.postcode = body.postcode;
      }
      if (body.phone_number) {
        company.phone_number = body.phone_number;
      }
      if (body.url) {
        company.url = body.url;
      }
      if (body.description) {
        company.description = body.description;
      }

      company.save();

      response.json(company);

      return;
    }

    response.status(404).json({});
  });
});

apiRouter.delete('/companies/:id', function deleteCompanyProfile(request, response) {

  var id = request.params.id;
  console.log('DELETE company ' + id);

  Company.findOne({id: id}, function handleDBQueryResults(error, company) {
    if (error) {
      response.status(500).json({
        success: false,
        message: 'Internal server error'
      });

      throw error;
    }

    if (company) {
      company.remove(function (error) {
        if (error) {
          response.status(500).send(error);
          return;
        }

        response.status(204).send({
          success: true
        });
      });
      return;
    }
    response.status(404).json({});
  });
});

apiRouter.get('/search/:searchString/', function searchArchaeologistProfiles(request, response) {

  var searchString = request.params.searchString;

  console.log(searchString);

  Archaeologist.find({specialism: searchString}, function handleDBQueryResults(error, archaeologists) {
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

app.use('/api', apiRouter);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
