import { Connector } from "./index";

(async () => {
  const connector = new Connector({
    username: "",
    password: "",
    connectionString: "",
  });
  await connector.connect();
  console.log(await connector.execute("SELECT * FROM global_name"));
})();
