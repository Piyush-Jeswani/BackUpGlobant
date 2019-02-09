package com.quantcast.utils;

import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.mail.BodyPart;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.search.FlagTerm;

// TODO: Auto-generated Javadoc
/**
 * The Class MailUtility.
 */
public class MailUtility {

	/**
	 * Instantiates a new mail utility.
	 */
	public MailUtility() {
		// TODO Auto-generated constructor stub
	}

	/** The protocol. */
	private String protocol = "imaps";
	
	/** The IMAP port. */
	private String IMAPPort = "993";
	
	/** The IMAP host. */
	private String IMAPHost = "imap.mail.yahoo.com";
	
	/** The enable start TLS. */
	private String enableStartTLS = "true";
	
	/** The password. */
	private String username, password = "";
	
	/** The properties. */
	private Properties properties = null;
	
	/** The email session. */
	private Session emailSession = null;
	
	/** The messages. */
	private Message[] messages = null;
	
	/** The store. */
	private Store store = null;
	
	/** The email folder. */
	private Folder emailFolder = null;

	/**
	 * Yahoo IMAP client.
	 *
	 * @param username the username
	 * @param password the password
	 */
	public void YahooIMAPClient(String username, String password) {
		this.username = username;
		this.password = password;
	}

	/**
	 * Sets the mail server property fields.
	 */
	private void setMailServerPropertyFields() {
		properties = new Properties();
		properties.put("mail.store.protocol", protocol);
		properties.put("mail.imaps.port", IMAPPort);
		properties.put("mail.pop3s.starttls.enable", enableStartTLS);
	}

	/**
	 * Gets the unread messages from message store.
	 *
	 * @return the unread messages from message store
	 * @throws MessagingException the messaging exception
	 * @throws IllegalStateException the illegal state exception
	 * @throws NullPointerException the null pointer exception
	 */
	private Message[] getUnreadMessagesFromMessageStore()
			throws MessagingException, IllegalStateException, NullPointerException {
		// creates a new session and connects to the message store
		emailSession = Session.getDefaultInstance(properties);
		store = emailSession.getStore(protocol);
		store.connect(IMAPHost, username, password);

		// retrieves unread messages from the inbox folder
		emailFolder = store.getFolder("INBOX");
		emailFolder.open(Folder.READ_WRITE);
		return emailFolder.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
	}

	/**
	 * Extract two FA pin.
	 *
	 * @param messageBody the message body
	 * @param pinLength the pin length
	 * @return the string
	 */
	private String extractTwoFAPin(String messageBody, int pinLength) {
		Pattern p = Pattern.compile("\\d{" + pinLength + "}");
		Matcher m = p.matcher(messageBody);

		if (m.find()) {
			return m.group();
		} else {
			return "Unable To Extract Pin From Email Body.";
		}
	}

	/**
	 * Gets the two FA pin.
	 *
	 * @param orgName the org name
	 * @param pinLength the pin length
	 * @param attemptsToRetrieveEmailMesssage the attempts to retrieve email messsage
	 * @return the two FA pin
	 */
	public String getTwoFAPin(String orgName, int pinLength, int attemptsToRetrieveEmailMesssage) {

		String twoFAPin = "";
		boolean didNotReceiveEmailMessage = true;

		if (orgName == null || "".equals(orgName)) {
			return "Invalid Organization Name.";
		}

		// sets mail server properties for IMAP
		setMailServerPropertyFields();

		while (didNotReceiveEmailMessage && attemptsToRetrieveEmailMesssage > 0) {
			try {
				attemptsToRetrieveEmailMesssage--;
				// creates a session object and connects to the message store to
				// retrieve unread messages
				messages = getUnreadMessagesFromMessageStore();

				for (Message message : messages) {
					// filter for Iris authentication email messages
					if (message.getSubject().contains(orgName)) {
						didNotReceiveEmailMessage = false;
						Multipart multipartContent = (Multipart) message.getContent();
						BodyPart messageBodyPart = multipartContent.getBodyPart(0);
						twoFAPin = extractTwoFAPin(messageBodyPart.getContent().toString(), pinLength);
					} else {
						// delete all other email messages
						message.setFlag(Flags.Flag.DELETED, true);
					}
				}

				// close the services and terminate the connections
				emailFolder.close(true);
				store.close();
			} catch (Exception e) {
				return e.toString();
			}
		}
		return twoFAPin;
	}

	/**
	 * Read mail.
	 *
	 * @param mailUserName the mail user name
	 * @param mailPassword the mail password
	 * @return the string
	 */
	public String readMail(String mailUserName, String mailPassword) {
		YahooIMAPClient(mailUserName, mailPassword);
		return getTwoFAPin("Dodge", 6, 500);
	}
	

}
