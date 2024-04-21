import 'dotenv/config';

const researchTask = "Indigenous Languages";
const researchValue = "Dictionary";
const researchType = "Url";
const researchName = "Lardil";

async function search() {
  // Bing search API is used here but can be replaced with any other search engine API
  const searchEndpoint = "https://api.bing.microsoft.com/v7.0/search?q=";
  const headers = {
    "Ocp-Apim-Subscription-Key": process.env.BING_API_KEY,
  };
  const searchJson = await fetch(`${searchEndpoint}${researchTask}:${researchValue}+'${researchName}'`, {
    headers: headers as any,
  });
  const searchData = await searchJson.json().catch((err) => {
    console.error("Error: ", err);
    return err.message;
  });

  const transformedData = searchData.webPages.value.map((data: any) => {
    return {
      name: data.name,
      url: data.url,
      information: data.snippet,
      deepLinks: data.deepLinks,
    };
  });
  const llmData = await llm(transformedData);
  return parseData(llmData);
}

async function llm(searchResponse: any) {
  // OAI is used here but can be replaced with any other language model API
  const completionsEndpoint = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-3.5-turbo";

  // This is some basic initial prompt engineering, but can be expanded and improved to your needs
  const prompt = `Ensures that any given response is formatted as a valid JSON array.

  Output the top 4 results that are closest to the term: ${researchTask}:${researchName}+${researchValue}:${researchType}.
  
  The value must be of type ${researchType}.
  Returns:  {name:"",value:"", information:""}`;

  const mostRelevantInformation = await fetch(completionsEndpoint, {
    method: "POST",
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        { role: "user", content: JSON.stringify(searchResponse) },
      ],
    }),
    headers: {
      Authorization: "Bearer " + process.env.OPEN_AI_API_KEY,
      "Content-Type": "application/json",
    },
  });
  const mostRelevantData = await mostRelevantInformation.json();
  return mostRelevantData.choices[0].message.content;
}

function parseData(data: any) {
  /*This parsing function is just a placeholder 
  A more complex parsing function must be implemented here for consistent data output*/
  return JSON.parse(data);
}

function main() {
  search().then((data) => {
    console.log(data);
  });
}

main();
