function mergeUser(event, data) {
  if (NeptunesPride.originalPlayer === undefined) {
    NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
  }
  let code = data?.split(":")[1] || otherUserCode;
  otherUserCode = code;
  if (otherUserCode) {
    let params = {
      game_number: game,
      api_version: "0.1",
      code: otherUserCode,
    };
    let eggers = jQuery.ajax({
      type: "POST",
      url: "https://np.ironhelmet.com/api",
      async: false,
      data: params,
      dataType: "json",
    });
    let universe = NeptunesPride.universe;
    let scan = eggers.responseJSON.scanning_data;
    universe.galaxy.stars = { ...scan.stars, ...universe.galaxy.stars };
    for (let s in scan.stars) {
      const star = scan.stars[s];
      //Add here a statement to skip if it is hero's star.
      if (star.v !== "0") {
        universe.galaxy.stars[s] = { ...universe.galaxy.stars[s], ...star };
      }
    }
    universe.galaxy.fleets = { ...scan.fleets, ...universe.galaxy.fleets };
    NeptunesPride.np.onFullUniverse(null, universe.galaxy);
    NeptunesPride.npui.onHideScreen(null, true);
    init();
  }
}
export { mergeUser };
