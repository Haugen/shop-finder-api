app.directive('shopDetails', [
	'$modal',
	function ($modal) {
	
	return {
		restrict: 'E',
		scope: {
			info: '=',
			saveShop: '&',
			shopExists: '&',
			getShopDetails: '&'
		},
		templateUrl: 'js/directives/shopDetailsDirective.html',
		link: function ($scope, element, attrs) {

			$scope.isInDatabase = false;
			var dataWasRetrieved = false;

			/* Check if the shop already exists in database */
			$scope.shopExists({ infoId: $scope.info.place_id })
				.then(function (response) {
					$scope.isInDatabase = response.data;
			});

			/* Get the full version of the shop only if we haven't before */
			$scope.internalGetShopDetails = function() {
				return new Promise(
					function(resolve, reject) {

						$scope.getShopDetails({
							sourceId: $scope.info.place_id
						}).then(function(response) {
							$scope.info = response;

							shopPhotosUrls = [];
							if ($scope.info.photos) {
								for (var i = 0; i < $scope.info.photos.length; i++) {
									shopPhotosUrls.push($scope.info.photos[i].getUrl({maxHeight: '600'}));
								};
							};

							$scope.info.photos = shopPhotosUrls;
							console.log("details: " + $scope.info.name);
							
							dataWasRetrieved = true;
							resolve("done");
						});

					});
			}
			
			/* Bring shop details if not yet, and saves them to API */
			$scope.internalSaveShop = function(shopInfo) {
				$scope.shopExists({ infoId: $scope.info.place_id })
					.then(function (response) {
						$scope.isInDatabase = response.data;
						if (!$scope.isInDatabase) {
							$scope.internalGetShopDetails().then(function(data) {

								shopToShow = $scope.info;

								/* Set default fields */
								opening_hours = {};
								if(shopToShow.opening_hours) {
									opening_hours = { 
											periods: shopToShow.opening_hours.periods,
											weekday_text: shopToShow.opening_hours.weekday_text
										};
								}

								/* Prepare data for API */
								var shopToSave = {
									name: shopToShow.name,
									address: shopToShow.formatted_address,
									phone_number: shopToShow.international_phone_number,
									opening_hours: opening_hours,
									photos: shopToShow.photos,
									geolocation: {
										lat: shopToShow.geometry.location.A,	
										lng: shopToShow.geometry.location.F,	
									},
									source: "Google",
									source_id: shopToShow.place_id,
									rating: shopToShow.rating,
									price_level: shopToShow.price_level,
									website: shopToShow.website
								};

								/* Save the data */
								$scope.saveShop({shopToSave: shopToSave})
									.then(function(response){
										$scope.isInDatabase = true;
								});

							});

						};
				});
			};

			$scope.getShopDetailsModal = function(shopInfo) {
				$scope.internalGetShopDetails().then(function(data) {
					var shopToShow = $scope.info;

					var modalInstance = $modal.open({
						animation: true,
						templateUrl: 'js/directives/shopDetailsModal.html',
						controller: 'ModalInstanceCtrl',
						scope: $scope,
						backdrop: true,
						// size: size,
						resolve: {
							shopInfo: function () {
					  			return shopToShow;
							}
						}
					});

					modalInstance.result.then(function () {
					}, function () {
						console.log('modal dismissed');
					});
				});

			};

		}
	};
}]);

app.directive('persistedShopDetails', [
	'$modal',
	function ($modal) {
	
	return {
		restrict: 'E',
		scope: {
			info: '=',
			deleteShop: '&'		
		},
		templateUrl: 'js/directives/persistedShopDetails.html',
		link: function ($scope, element, attrs) {

			$scope.info.photoUrl = $scope.info.photos[0];

			$scope.internalDeleteShop = function(shopId) {
				$scope.deleteShop({id: shopId});
			};

			$scope.getShopDetailsModal = function(shopInfo) {
				var shopToShow = shopInfo;
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'js/directives/shopDetailsModal.html',
					controller: 'ModalInstanceCtrl',
					scope: $scope,
					backdrop: true,
					resolve: {
						shopInfo: function () {
				  			return shopToShow;
						}
					}
				});

				modalInstance.result.then(function () {
				}, function () {
					console.log('modal dismissed');
				});
			};

		}
	};
}]);