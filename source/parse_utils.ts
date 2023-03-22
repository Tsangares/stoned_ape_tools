import { marked } from "marked";

export function markdown(markdownString: string): string {
  return marked.parse(markdownString);
}

export function is_valid_image_url(str: string): boolean {
  const protocol = "^(https:\\/\\/)";
  const domains = "(i\\.ibb\\.co|i\\.imgur\\.com|cdn\\.discordapp\\.com)";
  const content = "([&#_=;\\-\\?\\/\\w]{1,150})";
  const images =
    "(\\.)(gif|jpe?g|tiff?|png|webp|bmp|GIF|JPE?G|TIFF?|PNG|WEBP|BMP)$";
  const regex_string = protocol + domains + content + images;
  let regex = new RegExp(regex_string);
  let valid = regex.test(str);
  return valid;
}

export function is_valid_youtube(str: string): boolean {
  const protocol = "^(https://)";
  const domains = "(youtube.com|www.youtube.com|youtu.be)";
  const content = "([&#_=;-?/w]{1,150})";
  const regex_string = protocol + domains + content;
  let regex = new RegExp(regex_string);
  return regex.test(str);
}

function get_youtube_embed(link: string): string {
  return `<iframe width="560" height="315" src="https://www.youtube.com/embed/eHsDTGw_jZ8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}
