steal("can/map/sort", "can/test", "can/view/mustache", "can/view/stache", function () {
	module('can/map/sort');

	test('List events', function () {
		var list = new can.List([{
			name: 'Justin'
		}, {
			name: 'Brian'
		}, {
			name: 'Austin'
		}, {
			name: 'Mihael'
		}]);
		list.comparator = 'name';
		list.sort();
		// events on a list
		// - move - item from one position to another
		//          due to changes in elements that change the sort order
		// - add (items added to a list)
		// - remove (items removed from a list)
		// - reset (all items removed from the list)
		// - change something happened
		// a move directly on this list
		list.bind('move', function (ev, item, newPos, oldPos) {
			ok(ev, '"move" event passed `ev`');
			equal(item.name, 'Zed', '"move" event passed correct `item`');
			equal(newPos, 3, '"move" event passed correct `newPos`');
			equal(oldPos, 0, '"move" event passed correct `oldPos`');
		});

		// a remove directly on this list
		list.bind('remove', function (ev, items, oldPos) {
			ok(ev, '"remove" event passed ev');
			equal(items.length, 1, '"remove" event passed correct # of `item`\'s');
			equal(items[0].name, 'Alexis', '"remove" event passed correct `item`');
			equal(oldPos, 0, '"remove" event passed correct `oldPos`');
		});

		list.bind('add', function (ev, items, index) {
			ok(ev, '"add" event passed ev');
			equal(items.length, 1, '"add" event passed correct # of items');
			equal(items[0].name, 'Alexis', '"add" event passed correct `item`');
			equal(index, 0, '"add" event passed correct `index`');
		});

		// Push: Should result in a "add" event
		list.push({
			name: 'Alexis'
		});

		// Splice: Should result in a "remove" event
		list.splice(0, 1);

		// Update: Should result in a "move" event
		list[0].attr('name', 'Zed');
	});

	test('Passing a comparator to sort()', 1, function () {
		var list = new can.List([{
			priority: 4,
			name: 'low'
		}, {
			priority: 1,
			name: 'high'
		}, {
			priority: 2,
			name: 'middle'
		}, {
			priority: 3,
			name: 'mid'
		}]);
		list.sort(function (a, b) {
			// Sort functions always need to return the -1/0/1 integers
			if (a.priority < b.priority) {
				return -1;
			}
			return a.priority > b.priority ? 1 : 0;
		});
		equal(list[0].name, 'high');
	});

	test('Defining a comparator property', 1, function () {
		var list = new can.List([{
			priority: 4,
			name: 'low'
		}, {
			priority: 1,
			name: 'high'
		}, {
			priority: 2,
			name: 'middle'
		}, {
			priority: 3,
			name: 'mid'
		}]);
		list.comparator = 'priority';
		list.sort();
		equal(list[0].name, 'high');
	});

	test('Defining a comparator property that is a function of a can.Map', 4, function () {
		var list = new can.Map.List([
			new can.Map({
				text: 'Bbb',
				func: can.compute(function () {
					return 'bbb';
				})
			}),
			new can.Map({
				text: 'abb',
				func: can.compute(function () {
					return 'abb';
				})
			}),
			new can.Map({
				text: 'Aaa',
				func: can.compute(function () {
					return 'aaa';
				})
			}),
			new can.Map({
				text: 'baa',
				func: can.compute(function () {
					return 'baa';
				})
			})
		]);
		list.comparator = 'func';
		list.sort();
		equal(list.attr()[0].text, 'Aaa');
		equal(list.attr()[1].text, 'abb');
		equal(list.attr()[2].text, 'baa');
		equal(list.attr()[3].text, 'Bbb');
	});



	function renderedTests (helperType, renderer) {
		test('Render pushed item at correct index using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([{
				id: 'b'
			}]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			/// Check that the template rendered an item
			equal(firstElText, 'b',
				'First LI is a "b"');

			// Add another item
			items.push({
				id: 'a'
			});

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[0].innerText;

			console.log(el.innerHTML)

			// Check that the template rendered that item at the correct index
			equal(firstElText, 'a',
				'An item pushed into the list is rendered at the correct position');

		});

		test('Render unshifted item at correct index using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 'a' },
				{ id: 'c' }
			]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			/// Check that the template rendered an item
			equal(firstElText, 'a', 'First LI is a "a"');

			// Attempt to add an item to the beginning of the list
			items.unshift({
				id: 'b'
			});

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[1].innerText;

			// Check that the template rendered that item at the correct index
			equal(firstElText, 'b',
				'An item unshifted into the list is rendered at the correct position');

		});

		test('Render spliced item at correct index using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 'b' },
				{ id: 'c' }
			]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "b" is at the beginning of the list
			equal(firstElText, 'b',
				'First LI is a b');

			// Add a "1" to the middle of the list
			items.splice(1, 0, {
				id: 'a'
			});

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "a" was added to the beginning of the list despite
			// the splice
			equal(firstElText, 'a',
				'An item spliced into the list at the wrong position is rendered ' +
				'at the correct position');

		});

		test('Moves rendered item to correct index using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 'x' },
				{ id: 'y' },
				{ id: 'z' }
			]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "x" is at the beginning of the list
			equal(firstElText, 'x', 'First LI is a "x"');

			// Change the ID of the last item so that it's sorted above the first item
			items.attr('2').attr('id', 'a');

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "a" was added to the beginning of the list despite
			// the splice
			equal(firstElText, 'a', 'The last item was moved to the first position ' +
				'after it\'s value was changed');

		});

	}

	var blockHelperTemplate = '<ul>{{#items}}<li>{{id}}</li>{{/items}}';
	var eachHelperTemplate = '<ul>{{#each items}}<li>{{id}}</li>{{/each}}';

	renderedTests('{{#block}}', can.view.mustache(blockHelperTemplate));
	renderedTests('{{#block}}', can.stache(blockHelperTemplate));
	renderedTests('{{#each}}', can.view.mustache(eachHelperTemplate));
	renderedTests('{{#each}}', can.stache(eachHelperTemplate));

});
