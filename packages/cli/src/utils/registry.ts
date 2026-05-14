import fetch from "node-fetch";
import { REGISTRY_BASE_URL } from "../config";

export async function getRegistry(): Promise<any> {
  const url = `${REGISTRY_BASE_URL}/registry.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry from ${url}: ${response.statusText}`);
  }
  return response.json();
}

export async function getComponentFileContent(componentName: string, fileName: string) {
  const url = `${REGISTRY_BASE_URL}/components/${componentName}/${fileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file ${fileName} for ${componentName}`);
  }
  return response.text();
}
