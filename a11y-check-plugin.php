
<?php


/**
 * Plugin Name:       A11y-Check-Plugin BA-Abschluss
 * Description:       This Plugin does an accessibility-check on your WordPress-Sites. It uses 'axe-core' to test the accessibility of your site. Preview your pages; while the Plugin is activated tests will be performed.
 * Plugin Name:       A11Y-Check-Plugin 
 * Description:       This WordPress-Plugin does an accessibility-check on your created Sites. It uses 'axe-core' to test the accessibility of your site. Preview your pages; while the Plugin is activated tests will be performed.
 * Requires at least: 5.7
 * Requires PHP:      7.0
 * Version:           1.4.5
 * Author:            Eliphas Grökel
 * Author URI:        https://github.com/Hackhecht/a11y-check-plugin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       BA-Accessibility Check
 * Domain Path:       /languages
 */

defined("ABSPATH") || die();

/** Für den Zugriff auf die WordPress-Datenbank dient das globale $wpdb-Objekt.
 *  Es fungiert als Schnittstelle zur Datenbank und stellt die dafür benötigten Funktionen bereit.
 *  Weitere Informationen: https://developer.wordpress.org/reference/classes/wpdb/
 */

global $wpdb;
global $tableName;
$tableName = 'mein_a11y_plugin';

/** An dieser Stelle wird das Plugin im Wordpress-Admin-Menü registiert.
 * Weitere Informationen: https://developer.wordpress.org/reference/hooks/admin_menu/
 */

\add_action('admin_menu', function () {

    \add_menu_page(

        __('a11y-fun', 'a11y-game'),
        __('A11y-Check Plugin', 'a11y-game'),
        'manage_options',
        'elis-plugin',
        'a11y_game_admin_page',
        'dashicons-flag',
        3
    );
});

/** An dieser Stelle wird das HTML-Dokument für das Admin-Menü geladen. 
 */

function a11y_game_admin_page()
{
    $html_file = plugin_dir_path(__FILE__) . 'admin-page.html';

    if (file_exists($html_file)) {
        echo file_get_contents($html_file);
    }
}

/** An dieser Stelle wird ein CSS-Stylesheet für das Admin-Menü registriert.
 *  Weitere Informationen: https://developer.wordpress.org/reference/functions/wp_enqueue_style/
 *  Mit Hilfe des hooks wird das Stylesheet nur auf der entsprechenden Seite gelanden.
 */

function load_custom_wp_admin_style($hook)
{
    if ($hook != 'toplevel_page_elis-plugin') {
        return;
    }
    wp_enqueue_style(
        'custom_wp_admin_css',
        plugin_dir_url(__FILE__) . 'my_a11y_page_style.css'
    );
}

add_action('admin_enqueue_scripts', 'load_custom_wp_admin_style');

/** An dieser Stelle wird ein Script für das Admin-Menü registriert.
 *  Dieses Script liest die Testergebnisse aus der Datenbank und verarbeitet sie. 
 *  Weitere Informationen: https://developer.wordpress.org/reference/functions/wp_enqueue_script/
 */

function load_custom_wp_admin_script($hook)
{
    if ($hook != 'toplevel_page_elis-plugin') {
        return;
    }
    wp_enqueue_script(
        'custom_wp_admin_script',
        plugin_dir_url(__FILE__) . 'get_axe_data.js'
    );
}

add_action('admin_enqueue_scripts', 'load_custom_wp_admin_script');


/** An dieser Stelle wird ein Dashboard-Widget für das Admin-Menü registriert.
 *  Weitere Informationen: https://developer.wordpress.org/reference/functions/wp_add_dashboard_widget/
 */

function myplugin_register_dashboard_widget()
{
    wp_add_dashboard_widget(
        'A11y-Game Plugin', // ID des Widgets
        'Gamify A11y', // Titel des Widgets
        'myplugin_dashboard_widget_content' // Callback-Funktion, um den Inhalt des Widgets zu erstellen
    );
}

add_action('wp_dashboard_setup', 'myplugin_register_dashboard_widget');

/** Dies ist die Callback-Funktion, um das Widget mit Inhalten zu füllen.
 */

function myplugin_dashboard_widget_content()
{

    $html_file = plugin_dir_path(__FILE__) . 'dashboard-widget.html';

    if (file_exists($html_file)) {
        echo file_get_contents($html_file);
    }
}

/** An dieser Stelle werden die axe-core-Scripte zum testen jeder WP-Seite global registriert. 
 */

function enqueue_axe_script()
{
    wp_enqueue_script(
        'axe',
        plugin_dir_url(__FILE__) . 'axe.js',
        '',
        '',
        true,
    );


    wp_enqueue_script(
        'axe_test',
        plugin_dir_url(__FILE__) . 'axe_test.js',
        array('axe'),
        '',
        true,
    );

    wp_enqueue_script(
        'create_dom_element',
        plugin_dir_url(__FILE__) . 'create_dom_element.js',
        '',
        '',
        true,
    );
}

add_action('wp_enqueue_scripts', 'enqueue_axe_script');

/** Im folgenden wird die Wordpress-Rest-API angesprochen. 
 *  Dokumentation: https://developer.wordpress.org/rest-api/
 *  Es werden zwei Rest-Routen für das Senden und Empfangen der axe-Testdaten erstellt.
 *  Mehr Informationen: https://developer.wordpress.org/reference/functions/rest_api_init/
*/

\add_action('rest_api_init', function () {
    \register_rest_route('a11y-check-plugin/v1', 'save-results', [
        'methods' => 'POST',
        'callback' => 'save_axe_data',
        'permission_callback' => function () {
            return true;
        },
    ]);

});


\add_action('rest_api_init', function () {
    \register_rest_route('a11y-check-plugin/v1', 'get-results', [
        'methods' => 'GET',
        'callback' => 'read_axe_data',
        'permission_callback' => function () {
            return true;
        },
    ]);
});

/** Die folgende Funktion empfängt die Daten des axe-core-Test aus dem Nachrichtenbody der HTTP-Anfrage.  
 *  Mehr Informationen: https://developer.wordpress.org/reference/classes/wp_rest_request/
 */

function save_axe_data(\WP_REST_Request $request)
{
    $post_body_og = $request->get_body();

    $post_body = json_decode($post_body_og);
    
    database_setup();

    $url = $post_body->url;
    $testtime = $post_body->timestamp;

    error_log($post_body_og); 
    save_into_database($url, $testtime, $post_body_og);

}

/** Zum Speichern der Daten wird eine Tabelle in der Datenbank aufgesetzt und initiiert. 
 *  Mehr Informationen: https://developer.wordpress.org/reference/classes/wpdb/query/
 */

function database_setup()
{

    global $tableName, $wpdb;

    $sql = "SHOW TABLES LIKE '$tableName'";
    $result = $wpdb->query($sql);

    if ($result->num_rows > 0) {

        error_log("Die Tabelle $tableName ist bereits vorhanden.");

    } else {

        $sql = "CREATE TABLE $tableName (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        page_url VARCHAR(255) NOT NULL,
        time_stamp VARCHAR(255) NOT NULL,
        axe_test MEDIUMTEXT NOT NULL)";

        if ($wpdb->query($sql) === TRUE) {
            error_log("Die Tabelle $tableName wurde erfolgreich erstellt.");
        } else {
            error_log("Fehler beim Erstellen der Tabelle: " . $wpdb->show_errors());
        }
    }

}

/** Die folgende Funktion dient zum Speichern der Daten in der Datenbank. 
 *  Dafür werden die SQL-Anweisungen mit Hilfe von Platzhaltern gebunden und übergeben.
 *  Somit findet eine automatische Bereinigung und Maskierung von kritischen Werten uum Schutz vor SQL-Injektion statt.
 *  Mehr Informationen: https://developer.wordpress.org/reference/classes/wpdb/prepare/
 */

function save_into_database($url, $testtime, $post_body_og)
{

    global $tableName, $wpdb;

    $sql = "INSERT INTO $tableName (page_url, time_stamp, axe_test) VALUES (%s, %s, %s)";

    $wpdb->query(
         $wpdb->prepare($sql, $url, $testtime, $post_body_og)
        );

    if ( false === $wpdb->query($sql)) {
	    if ( $wp_error ) {
		return new WP_Error( 'db_query_error', 
		    ( 'Could not execute query' ), $wpdb->last_error );
	    } 
     } else {
         $insertedId = $wpdb->insert_id;
        error_log("Eintrag erfolgreich eingefügt. Die zugewiesene ID ist: $insertedId");
	    } 
}

/** Für die Darstellung und Auswertung der Test-Ergenisse werden die Daten via HTTP-Anfrage wieder an das Frontend übermittelt.
 *  Weitere Informationen: https://developer.wordpress.org/reference/functions/rest_ensure_response/
 */

function read_axe_data()
{

    $results = get_test_data();

    $response_data = array(

        'database_entry' => $results,
    );

    return rest_ensure_response($response_data);
}

/** Die benötigten Daten werden aus der Datenbank ausgelesen.
 *  Dokumentation: https://developer.wordpress.org/reference/classes/wpdb/get_results/
 */

function get_test_data()
{
    global $tableName, $wpdb;

    $query = "SELECT * FROM $tableName";
    $results = $wpdb->get_results($query);

    if ($results) {
        error_log("Abfrage der Daten aus der Datenbank erfolgreich.");
    } else {
        error_log("Keine Daten in der Datenbank vorhanden.");
    }

    return $results;
}
