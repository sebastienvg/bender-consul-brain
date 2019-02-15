var consul = require("consul")({
  host: process.env.CONSUL_HOST || "localhost",
  port: process.env.CONSUL_PORT || "8500"
});

var prefix = "bender:storage";

module.exports = function(robot) {
  robot.brain.setAutoSave(false);

  consul.kv.get(prefix, function(err, res) {
    if (err) throw err;

    if(res != undefined) {
      robot.logger.info("bender-consul-brain: Data for " + prefix + " brain retrieved from Consul")
      robot.brain.mergeData(JSON.parse(res["Value"]));
    } else {
      robot.logger.info("bender-consul-brain: Initializing new data for " + prefix + " brain")
      robot.brain.mergeData({});
    }

    robot.brain.setAutoSave(true);
  });

  robot.brain.on('save', function(data) {
    consul.kv.set(prefix, JSON.stringify(data), function(err, result) {
      if (err) throw err;
    });
  });
}
